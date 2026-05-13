"use client";

import { useState } from "react";
import { CreativeInput } from "@/types";
import { Sparkles, Loader2 } from "lucide-react";

interface Props {
  onSubmit: (input: CreativeInput) => void;
  isLoading: boolean;
}

const CAMPAIGN_GOALS = ["브랜드 인지도 향상", "구매 전환 증대", "앱 설치 유도", "리드 수집", "트래픽 증대", "재구매 유도"];
const BRAND_TONES = ["전문적이고 신뢰감 있는", "친근하고 유머러스한", "고급스럽고 세련된", "젊고 트렌디한", "따뜻하고 감성적인", "강렬하고 임팩트 있는"];

export default function InputForm({ onSubmit, isLoading }: Props) {
  const [form, setForm] = useState<CreativeInput>({
    product_name: "",
    product_description: "",
    target_audience: "",
    campaign_goal: "구매 전환 증대",
    brand_tone: "전문적이고 신뢰감 있는",
    key_message: "",
    include_video: false,
  });

  const update = (key: keyof CreativeInput, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 제품명 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            제품/서비스명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="예: 무신사 스탠다드 패딩"
            value={form.product_name}
            onChange={(e) => update("product_name", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
          />
        </div>

        {/* 타겟 고객 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            타겟 고객 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="예: 20-30대 패션에 관심 있는 남성"
            value={form.target_audience}
            onChange={(e) => update("target_audience", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
          />
        </div>
      </div>

      {/* 제품 설명 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          제품/서비스 상세 설명 <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={4}
          placeholder="제품의 주요 특징, 가격, 혜택, 차별점 등을 자세히 입력해주세요.&#10;예: 고급 구스다운 소재, 49,900원 한정 특가, 5가지 컬러, 방수 기능..."
          value={form.product_description}
          onChange={(e) => update("product_description", e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 캠페인 목표 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">캠페인 목표</label>
          <select
            value={form.campaign_goal}
            onChange={(e) => update("campaign_goal", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition bg-white"
          >
            {CAMPAIGN_GOALS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* 브랜드 톤앤매너 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">브랜드 톤앤매너</label>
          <select
            value={form.brand_tone}
            onChange={(e) => update("brand_tone", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition bg-white"
          >
            {BRAND_TONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 핵심 메시지 (선택) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          핵심 메시지 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <input
          type="text"
          placeholder="강조하고 싶은 슬로건이나 메시지가 있다면 입력해주세요"
          value={form.key_message}
          onChange={(e) => update("key_message", e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
        />
      </div>

      {/* 영상 포함 여부 */}
      <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <input
          type="checkbox"
          id="include_video"
          checked={form.include_video}
          onChange={(e) => update("include_video", e.target.checked)}
          className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
        />
        <label htmlFor="include_video" className="cursor-pointer">
          <span className="text-sm font-semibold text-gray-700">영상 소재도 함께 생성</span>
          <span className="text-xs text-gray-500 block">이미지를 영상으로 변환합니다 (생성 시간 추가 소요)</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg shadow-lg shadow-indigo-200"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            AI 소재 생성 중... (약 1-2분 소요)
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            소재 5개 자동 생성하기
          </>
        )}
      </button>
    </form>
  );
}
