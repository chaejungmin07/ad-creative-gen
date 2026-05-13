import { CreativeInput, GenerateResponse, MediaSize, GeneratedCreative } from "@/types";

export async function generateCreatives(input: CreativeInput): Promise<GenerateResponse> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "서버 오류가 발생했습니다." }));
    throw new Error(err.error || "소재 생성 실패");
  }
  return res.json();
}

export async function getMediaSizes(): Promise<MediaSize[]> {
  const res = await fetch("/api/sizes");
  if (!res.ok) throw new Error("사이즈 목록 로드 실패");
  const data = await res.json();
  return data.sizes;
}

export async function downloadCreative(
  creative: GeneratedCreative,
  sizeName: string,
  customWidth?: number,
  customHeight?: number
): Promise<Blob> {
  const res = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      variant_id: creative.variant_id,
      size_name: sizeName,
      image_prompt: creative.image_prompt,
      color_scheme: creative.color_scheme,
      headline: creative.headline,
      subheadline: creative.subheadline,
      cta: creative.cta,
      custom_width: customWidth,
      custom_height: customHeight,
    }),
  });
  if (!res.ok) throw new Error("다운로드 실패");
  return res.blob();
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
