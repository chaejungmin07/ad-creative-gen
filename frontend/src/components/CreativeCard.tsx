"use client";

import { useState } from "react";
import { GeneratedCreative, APPEAL_TYPE_LABELS } from "@/types";
import { Download, Eye } from "lucide-react";
import SizeDownloadModal from "./SizeDownloadModal";

interface Props {
  creative: GeneratedCreative;
  index: number;
}

export default function CreativeCard({ creative, index }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const appealInfo = APPEAL_TYPE_LABELS[creative.appeal_type] || {
    label: creative.appeal_type,
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: "📌",
  };

  return (
    <>
      <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {creative.image_url ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              )}
              <img
                src={creative.image_url}
                alt={creative.concept_title}
                className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">
              🖼️
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
            <button
              onClick={() => window.open(creative.image_url || "", "_blank")}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition text-white"
              title="크게 보기"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="p-3 bg-indigo-600 rounded-full hover:bg-indigo-700 transition text-white"
              title="다운로드"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

          {/* Variant number */}
          <div className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-sm font-bold text-gray-700 shadow-sm">
            {index + 1}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Appeal badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${appealInfo.color} mb-3`}>
            {appealInfo.icon} {appealInfo.label}
          </span>

          <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{creative.concept_title}</h3>

          <div className="space-y-2 mb-4">
            <p className="text-sm font-semibold text-gray-800 line-clamp-1">
              "{creative.headline}"
            </p>
            <p className="text-xs text-gray-500 line-clamp-2">{creative.subheadline}</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg font-medium">
              {creative.cta}
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              <Download className="w-4 h-4" />
              다운로드
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-3 line-clamp-2 border-t border-gray-50 pt-3">
            {creative.description}
          </p>
        </div>
      </div>

      {showModal && (
        <SizeDownloadModal
          creative={creative}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
