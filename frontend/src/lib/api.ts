import { CreativeInput, GenerateResponse, MediaSize } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function generateCreatives(input: CreativeInput): Promise<GenerateResponse> {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "서버 오류가 발생했습니다." }));
    throw new Error(err.detail || "소재 생성 실패");
  }
  return res.json();
}

export async function getMediaSizes(): Promise<MediaSize[]> {
  const res = await fetch(`${API_BASE}/api/download/sizes`);
  if (!res.ok) throw new Error("사이즈 목록 로드 실패");
  const data = await res.json();
  return data.sizes;
}

export async function downloadCreative(
  sessionId: string,
  variantId: number,
  sizeName: string,
  format: "image" | "video",
  customWidth?: number,
  customHeight?: number
): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      variant_id: variantId,
      size_name: sizeName,
      format,
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
