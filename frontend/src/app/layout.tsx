import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 소재 자동 생성기 | Creative AI",
  description: "AI가 5가지 소구점 소재를 자동으로 생성합니다. DA 매체 최적화 사이즈로 즉시 다운로드.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
