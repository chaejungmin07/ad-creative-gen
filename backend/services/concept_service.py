import anthropic
import json
import os
from models.schemas import CreativeInput, ConceptVariant

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

APPEAL_TYPES = [
    {"id": 1, "type": "price_benefit", "label": "가격/혜택 소구", "focus": "할인, 프로모션, 가성비, 혜택 강조"},
    {"id": 2, "type": "feature_performance", "label": "기능/성능 소구", "focus": "제품의 핵심 기능과 차별화된 성능 강조"},
    {"id": 3, "type": "emotional_lifestyle", "label": "감성/라이프스타일 소구", "focus": "감성적 연결, 라이프스타일 욕구, 자아실현"},
    {"id": 4, "type": "social_proof", "label": "사회적 증거 소구", "focus": "사용자 리뷰, 판매량, 전문가 추천, 신뢰도"},
    {"id": 5, "type": "problem_solution", "label": "문제해결 소구", "focus": "페인포인트 공감 후 명확한 솔루션 제시"},
]


async def generate_concepts(creative_input: CreativeInput) -> list[ConceptVariant]:
    prompt = f"""당신은 DA(디스플레이 광고) 전문 크리에이티브 디렉터입니다.
다음 제품/서비스에 대해 5가지 소구점이 다른 광고 소재 컨셉을 만들어주세요.

**제품 정보:**
- 제품명: {creative_input.product_name}
- 제품 설명: {creative_input.product_description}
- 타겟 고객: {creative_input.target_audience}
- 캠페인 목표: {creative_input.campaign_goal}
- 브랜드 톤앤매너: {creative_input.brand_tone}
{f'- 핵심 메시지: {creative_input.key_message}' if creative_input.key_message else ''}

**5가지 소구점별 컨셉을 JSON 배열로 만들어주세요:**

각 소구점:
1. 가격/혜택 소구 (price_benefit): 할인, 프로모션, 가성비 강조
2. 기능/성능 소구 (feature_performance): 핵심 기능과 성능 차별화
3. 감성/라이프스타일 소구 (emotional_lifestyle): 감성, 라이프스타일, 욕구
4. 사회적 증거 소구 (social_proof): 리뷰, 신뢰, 추천
5. 문제해결 소구 (problem_solution): 페인포인트 → 솔루션

**응답 형식 (JSON 배열만, 다른 텍스트 없이):**
[
  {{
    "id": 1,
    "appeal_type": "price_benefit",
    "concept_title": "소구점 제목 (한글, 20자 이내)",
    "headline": "메인 헤드라인 (20자 이내, 임팩트 있게)",
    "subheadline": "서브 헤드라인 (40자 이내)",
    "cta": "CTA 버튼 문구 (10자 이내)",
    "image_prompt": "DALL-E용 영문 이미지 프롬프트 (구체적이고 상세하게, 광고 이미지 스타일, 300자 이내)",
    "description": "이 소구점의 핵심 전략 설명 (100자 이내)",
    "color_scheme": "주 색상 테마 (예: warm orange gradient, corporate blue, pastel pink)"
  }},
  ... (5개 모두)
]

각 컨셉은 명확히 다른 소구점을 가져야 하며, 실제 광고에 바로 사용 가능한 수준으로 작성해주세요.
image_prompt는 반드시 영어로 작성하고, 광고 소재에 적합한 professional, clean, eye-catching 스타일로 만들어주세요."""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    content = message.content[0].text.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()

    concepts_data = json.loads(content)
    variants = []
    for c in concepts_data:
        variants.append(
            ConceptVariant(
                id=c["id"],
                appeal_type=c["appeal_type"],
                concept_title=c["concept_title"],
                headline=c["headline"],
                subheadline=c["subheadline"],
                cta=c["cta"],
                image_prompt=c["image_prompt"],
                description=c["description"],
                color_scheme=c["color_scheme"],
            )
        )
    return variants
