export interface CreativeInput {
  product_name: string;
  product_description: string;
  target_audience: string;
  campaign_goal: string;
  brand_tone: string;
  key_message?: string;
  include_video: boolean;
}

export interface GeneratedCreative {
  variant_id: number;
  appeal_type: string;
  concept_title: string;
  headline: string;
  subheadline: string;
  cta: string;
  image_url: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  description: string;
  color_scheme: string;
  image_prompt: string;
}

export interface GenerateResponse {
  session_id: string;
  creatives: GeneratedCreative[];
  status: string;
}

export interface MediaSize {
  name: string;
  width: number;
  height: number;
  description: string;
  platform: string;
}

export const APPEAL_TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  price_benefit: { label: "가격/혜택", color: "bg-orange-100 text-orange-700 border-orange-200", icon: "💰" },
  feature_performance: { label: "기능/성능", color: "bg-blue-100 text-blue-700 border-blue-200", icon: "⚡" },
  emotional_lifestyle: { label: "감성/라이프스타일", color: "bg-pink-100 text-pink-700 border-pink-200", icon: "✨" },
  social_proof: { label: "사회적 증거", color: "bg-green-100 text-green-700 border-green-200", icon: "⭐" },
  problem_solution: { label: "문제해결", color: "bg-purple-100 text-purple-700 border-purple-200", icon: "🎯" },
};
