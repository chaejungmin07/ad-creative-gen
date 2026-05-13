"use client";

import { useState, useEffect } from "react";
import { GeneratedCreative, MediaSize } from "@/types";
import { X, Download, Loader2 } from "lucide-react";
import { getMediaSizes, downloadCreative, triggerDownload } from "@/lib/api";

interface Props {
  creative: GeneratedCreative;
  onClose: () => void;
}

const PLATFORM_ICONS: Record<string, string> = {
  Instagram: "📸",
  Facebook: "👍",
  TikTok: "🎵",
  YouTube: "▶️",
  Display: "🖥️",
  Kakao: "💬",
  Naver: "🔍",
  Custom: "✏️",
};

export default function SizeDownloadModal({ creative, onClose }: Props) {
  const [sizes, setSizes] = useState<MediaSize[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("insta_feed");
  const format = "image";
  const [customW, setCustomW] = useState(1080);
  const [customH, setCustomH] = useState(1080);
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getMediaSizes().then(setSizes).catch(console.error);
  }, []);

  const grouped = sizes.reduce<Record<string, MediaSize[]>>((acc, s) => {
    if (!acc[s.platform]) acc[s.platform] = [];
    acc[s.platform].push(s);
    return acc;
  }, {});

  const selected = sizes.find((s) => s.name === selectedSize);

  const handleDownload = async () => {
    setDownloading(true);
    setDone(false);
    try {
      const blob = await downloadCreative(
        creative,
        selectedSize,
        selectedSize === "custom" ? customW : undefined,
        selectedSize === "custom" ? customH : undefined
      );
      triggerDownload(blob, `creative_${creative.appeal_type}_${selectedSize}.png`);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch (e) {
      alert("다운로드 실패: " + (e as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">소재 다운로드</h2>
            <p className="text-sm text-gray-500 mt-0.5">{creative.concept_title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Size selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">매체/사이즈 선택</label>
            <div className="space-y-4">
              {Object.entries(grouped).map(([platform, platformSizes]) => (
                <div key={platform}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    {PLATFORM_ICONS[platform] || "📌"} {platform}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {platformSizes.filter((s) => s.name !== "custom").map((s) => (
                      <button
                        key={s.name}
                        onClick={() => setSelectedSize(s.name)}
                        className={`p-3 rounded-xl border-2 text-left transition ${
                          selectedSize === s.name
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-100 hover:border-gray-200 bg-gray-50"
                        }`}
                      >
                        <p className={`text-xs font-bold ${selectedSize === s.name ? "text-indigo-700" : "text-gray-700"}`}>
                          {s.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {s.width} × {s.height}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Custom size */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  ✏️ Custom
                </p>
                <button
                  onClick={() => setSelectedSize("custom")}
                  className={`w-full p-3 rounded-xl border-2 text-left transition ${
                    selectedSize === "custom"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-100 hover:border-gray-200 bg-gray-50"
                  }`}
                >
                  <p className={`text-xs font-bold ${selectedSize === "custom" ? "text-indigo-700" : "text-gray-700"}`}>
                    커스텀 사이즈
                  </p>
                  {selectedSize === "custom" && (
                    <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="number"
                        value={customW}
                        onChange={(e) => setCustomW(Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-xs text-center"
                        min={100}
                        max={4000}
                      />
                      <span className="text-gray-400 text-xs">×</span>
                      <input
                        type="number"
                        value={customH}
                        onChange={(e) => setCustomH(Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-xs text-center"
                        min={100}
                        max={4000}
                      />
                      <span className="text-gray-400 text-xs">px</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Selected info */}
          {selected && selectedSize !== "custom" && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                선택된 사이즈:{" "}
                <span className="font-bold text-gray-900">
                  {selected.description} ({selected.width} × {selected.height}px)
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 transition-all flex items-center justify-center gap-3 text-base shadow-lg shadow-indigo-200"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                이미지 처리 중...
              </>
            ) : done ? (
              <>✅ 다운로드 완료!</>
            ) : (
              <>
                <Download className="w-5 h-5" />
                이미지 다운로드
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
