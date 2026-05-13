"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "Claude AI가 5가지 소구점 컨셉 기획 중...", duration: 15 },
  { label: "DALL-E 3로 소재 이미지 생성 중 (1/5)...", duration: 20 },
  { label: "소재 이미지 생성 중 (2/5)...", duration: 20 },
  { label: "소재 이미지 생성 중 (3/5)...", duration: 20 },
  { label: "소재 이미지 생성 중 (4/5)...", duration: 20 },
  { label: "소재 이미지 생성 중 (5/5)...", duration: 20 },
  { label: "소재 최종 처리 중...", duration: 5 },
];

export default function LoadingState() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = STEPS.reduce((s, step) => s + step.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 1;
      setProgress(Math.min((elapsed / totalDuration) * 100, 95));

      let cumulative = 0;
      for (let i = 0; i < STEPS.length; i++) {
        cumulative += STEPS[i].duration;
        if (elapsed < cumulative) {
          setStepIndex(i);
          break;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-16 flex flex-col items-center gap-8">
      {/* Animated logo */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-200 animate-pulse">
          <span className="text-4xl">✨</span>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full animate-bounce border-2 border-white" />
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">AI 소재 생성 중</h3>
        <p className="text-sm text-gray-500">{STEPS[stepIndex]?.label}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>진행률</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="w-full max-w-md space-y-2">
        {STEPS.slice(0, 4).map((step, i) => (
          <div key={i} className={`flex items-center gap-3 text-sm transition-opacity ${i <= stepIndex ? "opacity-100" : "opacity-30"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              i < stepIndex ? "bg-green-500" : i === stepIndex ? "bg-indigo-500 animate-pulse" : "bg-gray-200"
            }`}>
              {i < stepIndex ? (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <span className={i === stepIndex ? "text-indigo-700 font-medium" : "text-gray-500"}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
