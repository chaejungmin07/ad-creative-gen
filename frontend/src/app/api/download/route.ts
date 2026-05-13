import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { MEDIA_SIZES } from "../sizes/route";

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

function buildPollinationsUrl(imagePrompt: string, colorScheme: string, variantId: number): string {
  const prompt = encodeURIComponent(
    `${imagePrompt}. Professional advertisement creative, clean commercial look, ` +
    `color scheme: ${colorScheme}, no text overlay, high quality, photorealistic`
  );
  const seed = variantId * 7919;
  return `${POLLINATIONS_BASE}/${prompt}?width=1024&height=1024&model=flux&seed=${seed}&nologo=true`;
}

function buildTextOverlaySvg(
  width: number,
  height: number,
  headline: string,
  subheadline: string,
  cta: string
): Buffer {
  if (width <= 300 && height <= 100) return Buffer.from("<svg/>");

  const headlineSize = Math.max(Math.floor(width * 0.052), 14);
  const subSize = Math.max(Math.floor(width * 0.028), 11);
  const ctaSize = Math.max(Math.floor(width * 0.026), 10);
  const pad = Math.floor(width * 0.05);
  const barH = Math.floor(height * 0.38);

  // Escape XML special characters
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const ctaBtnW = Math.min(cta.length * ctaSize * 0.65 + pad, width * 0.5);
  const ctaBtnH = ctaSize + Math.floor(height * 0.025);
  const ctaY = height - pad - ctaBtnH;
  const subY = ctaY - Math.floor(height * 0.035) - subSize;
  const hlY = subY - Math.floor(height * 0.022) - headlineSize;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.78"/>
    </linearGradient>
  </defs>
  <rect x="0" y="${height - barH}" width="${width}" height="${barH}" fill="url(#g)"/>
  <text x="${pad}" y="${hlY + headlineSize}" font-family="Arial, sans-serif" font-size="${headlineSize}"
        font-weight="bold" fill="white"
        style="text-shadow: 1px 1px 3px rgba(0,0,0,0.8)">${esc(headline)}</text>
  <text x="${pad}" y="${subY + subSize}" font-family="Arial, sans-serif" font-size="${subSize}"
        fill="#e0e0e0">${esc(subheadline)}</text>
  <rect x="${pad}" y="${ctaY}" width="${ctaBtnW}" height="${ctaBtnH}" rx="8" fill="#FF5722"/>
  <text x="${pad + ctaBtnW / 2}" y="${ctaY + ctaBtnH * 0.68}" font-family="Arial, sans-serif"
        font-size="${ctaSize}" font-weight="bold" fill="white" text-anchor="middle">${esc(cta)}</text>
</svg>`;

  return Buffer.from(svg);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    variant_id,
    size_name,
    image_prompt,
    color_scheme,
    headline,
    subheadline,
    cta,
    custom_width,
    custom_height,
  } = body;

  // Determine target size
  let targetW: number;
  let targetH: number;
  if (size_name === "custom") {
    targetW = Number(custom_width) || 1080;
    targetH = Number(custom_height) || 1080;
  } else {
    const sizeObj = MEDIA_SIZES.find((s) => s.name === size_name);
    targetW = sizeObj?.width || 1080;
    targetH = sizeObj?.height || 1080;
  }

  // Fetch original image from Pollinations.ai
  const imageUrl = buildPollinationsUrl(image_prompt, color_scheme, Number(variant_id));
  const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
  if (!imgRes.ok) {
    return NextResponse.json({ error: "이미지 다운로드 실패" }, { status: 500 });
  }
  const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

  // Resize with center crop
  const resized = await sharp(imgBuffer)
    .resize(targetW, targetH, { fit: "cover", position: "center" })
    .png()
    .toBuffer();

  // Add text overlay (skip for tiny banners)
  const overlayBuffer = buildTextOverlaySvg(targetW, targetH, headline, subheadline, cta);
  const final = await sharp(resized)
    .composite([{ input: overlayBuffer, top: 0, left: 0 }])
    .png()
    .toBuffer();

  return new NextResponse(final as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="creative_${size_name}.png"`,
    },
  });
}
