import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";
const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

interface ConceptVariant {
  id: number;
  appeal_type: string;
  concept_title: string;
  headline: string;
  subheadline: string;
  cta: string;
  image_prompt: string;
  description: string;
  color_scheme: string;
}

function buildPollinationsUrl(variant: ConceptVariant): string {
  const prompt = encodeURIComponent(
    `${variant.image_prompt}. Professional advertisement creative, clean commercial look, ` +
    `color scheme: ${variant.color_scheme}, no text overlay, high quality, photorealistic`
  );
  const seed = variant.id * 7919;
  return `${POLLINATIONS_BASE}/${prompt}?width=1024&height=1024&model=flux&seed=${seed}&nologo=true`;
}

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  const body = await req.json();
  const { product_name, product_description, target_audience, campaign_goal, brand_tone, key_message } = body;

  const prompt = `당신은 DA(디스플레이 광고) 전문 크리에이티브 디렉터입니다.
다음 제품/서비스에 대해 5가지 소구점이 다른 광고 소재 컨셉을 만들어주세요.

**제품 정보:**
- 제품명: ${product_name}
- 제품 설명: ${product_description}
- 타겟 고객: ${target_audience}
- 캠페인 목표: ${campaign_goal}
- 브랜드 톤앤매너: ${brand_tone || "전문적이고 신뢰감 있는"}
${key_message ? `- 핵심 메시지: ${key_message}` : ""}

**5가지 소구점별 컨셉을 JSON 배열로 만들어주세요:**

각 소구점:
1. 가격/혜택 소구 (price_benefit): 할인, 프로모션, 가성비 강조
2. 기능/성능 소구 (feature_performance): 핵심 기능과 성능 차별화
3. 감성/라이프스타일 소구 (emotional_lifestyle): 감성, 라이프스타일, 욕구
4. 사회적 증거 소구 (social_proof): 리뷰, 신뢰, 추천
5. 문제해결 소구 (problem_solution): 페인포인트 → 솔루션

**응답 형식 (JSON 배열만, 다른 텍스트 없이):**
[
  {
    "id": 1,
    "appeal_type": "price_benefit",
    "concept_title": "소구점 제목 (한글, 20자 이내)",
    "headline": "메인 헤드라인 (20자 이내, 임팩트 있게)",
    "subheadline": "서브 헤드라인 (40자 이내)",
    "cta": "CTA 버튼 문구 (10자 이내)",
    "image_prompt": "영문 이미지 프롬프트 (구체적이고 상세하게, 광고 이미지 스타일, 200자 이내)",
    "description": "이 소구점의 핵심 전략 설명 (100자 이내)",
    "color_scheme": "주 색상 테마 (예: warm orange gradient, corporate blue, pastel pink)"
  }
]

각 컨셉은 명확히 다른 소구점을 가져야 하며, image_prompt는 반드시 영어로 작성하세요.`;

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!groqRes.ok) {
    const err = await groqRes.text();
    return NextResponse.json({ error: `Groq API 오류: ${err}` }, { status: 500 });
  }

  const groqData = await groqRes.json();
  let content: string = groqData.choices[0].message.content.trim();

  if (content.startsWith("```")) {
    content = content.split("```")[1];
    if (content.startsWith("json")) content = content.slice(4);
  }
  content = content.trim();

  const variants: ConceptVariant[] = JSON.parse(content);

  const creatives = variants.map((v) => ({
    variant_id: v.id,
    appeal_type: v.appeal_type,
    concept_title: v.concept_title,
    headline: v.headline,
    subheadline: v.subheadline,
    cta: v.cta,
    image_url: buildPollinationsUrl(v),
    video_url: null,
    thumbnail_url: null,
    description: v.description,
    color_scheme: v.color_scheme,
    // 다운로드 시 필요한 원본 프롬프트 보관
    image_prompt: v.image_prompt,
  }));

  return NextResponse.json({
    session_id: Date.now().toString(36),
    creatives,
    status: "completed",
  });
}
