"use client";

import { useState } from "react";
import { CreativeInput, GeneratedCreative } from "@/types";
import { generateCreatives } from "@/lib/api";
import InputForm from "@/components/InputForm";
import CreativeCard from "@/components/CreativeCard";
import LoadingState from "@/components/LoadingState";
import { Sparkles, RefreshCw } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [creatives, setCreatives] = useState<GeneratedCreative[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);

  const handleGenerate = async (input: CreativeInput) => {
    setIsLoading(true);
    setError(null);
    setCreatives([]);
    setShowForm(false);

    try {
      const result = await generateCreatives(input);
      setSessionId(result.session_id);
      setCreatives(result.creatives);
    } catch (e) {
      setError((e as Error).message);
      setShowForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCreatives([]);
    setSessionId(null);
    setError(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Creative AI</h1>
              <p className="text-xs text-gray-400">AI 소재 자동 생성</p>
            </div>
          </div>

          {creatives.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition"
            >
              <RefreshCw className="w-4 h-4" />
              새로 만들기
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        {showForm && !isLoading && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Claude + DALL-E 3 기반
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
              AI가 만드는
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> 5가지 소재</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              제품 정보를 입력하면 가격소구 · 기능소구 · 감성소구 · 사회적증거 · 문제해결
              소구점으로 소재를 자동 생성합니다
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {["5가지 소구점 자동 기획", "DALL-E 3 이미지 생성", "DA 매체 사이즈 최적화", "이미지/영상 다운로드"].map((f) => (
                <span key={f} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm rounded-full shadow-sm">
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        {showForm && !isLoading && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">제품/서비스 정보 입력</h3>
              <InputForm onSubmit={handleGenerate} isLoading={isLoading} />
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <LoadingState />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-xl mx-auto mt-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
              <strong>오류 발생:</strong> {error}
            </div>
          </div>
        )}

        {/* Results */}
        {creatives.length > 0 && sessionId && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900">생성된 소재 {creatives.length}개</h2>
                <p className="text-gray-500 mt-1">마음에 드는 소재를 선택하여 원하는 사이즈로 다운로드하세요</p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                재생성
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { label: "💰 가격/혜택", color: "bg-orange-50 text-orange-600 border-orange-100" },
                { label: "⚡ 기능/성능", color: "bg-blue-50 text-blue-600 border-blue-100" },
                { label: "✨ 감성/라이프스타일", color: "bg-pink-50 text-pink-600 border-pink-100" },
                { label: "⭐ 사회적 증거", color: "bg-green-50 text-green-600 border-green-100" },
                { label: "🎯 문제해결", color: "bg-purple-50 text-purple-600 border-purple-100" },
              ].map((b) => (
                <span key={b.label} className={`px-3 py-1 rounded-full text-xs font-semibold border ${b.color}`}>
                  {b.label}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {creatives.map((creative, index) => (
                <CreativeCard
                  key={creative.variant_id}
                  creative={creative}
                  sessionId={sessionId}
                  index={index}
                />
              ))}
            </div>

            <div className="mt-10 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 text-center">
              <p className="text-sm text-gray-600">
                각 카드의 <strong>다운로드 버튼</strong>을 클릭하면 매체별 사이즈를 선택하여 다운로드할 수 있습니다
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
