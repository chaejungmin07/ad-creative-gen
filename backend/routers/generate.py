from fastapi import APIRouter, HTTPException, BackgroundTasks
from models.schemas import CreativeInput, GenerateResponse, GeneratedCreative
from services.concept_service import generate_concepts
from services.image_service import generate_all_images
import uuid
import os

router = APIRouter(prefix="/api/generate", tags=["generate"])

# In-memory session store (Redis 대체용)
sessions: dict[str, dict] = {}


@router.post("", response_model=GenerateResponse)
async def generate_creatives(creative_input: CreativeInput, background_tasks: BackgroundTasks):
    session_id = str(uuid.uuid4())[:8]

    try:
        # 1. Claude로 5개 컨셉 생성
        variants = await generate_concepts(creative_input)

        # 2. DALL-E로 이미지 생성 (병렬)
        image_paths = await generate_all_images(variants, session_id)

        # 3. 세션에 저장
        sessions[session_id] = {
            "variants": {v.id: v for v in variants},
            "image_paths": image_paths,
            "input": creative_input,
        }

        # 4. 응답 구성
        base_url = os.getenv("BASE_URL", "http://localhost:8000")
        creatives = []
        for v in variants:
            img_path = image_paths.get(v.id)
            img_url = f"{base_url}/api/files/{session_id}/variant_{v.id}_original.png" if img_path else None
            creatives.append(
                GeneratedCreative(
                    variant_id=v.id,
                    appeal_type=v.appeal_type,
                    concept_title=v.concept_title,
                    headline=v.headline,
                    subheadline=v.subheadline,
                    cta=v.cta,
                    image_url=img_url,
                    description=v.description,
                    color_scheme=v.color_scheme,
                )
            )

        return GenerateResponse(session_id=session_id, creatives=creatives, status="completed")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    session = sessions[session_id]
    return {
        "session_id": session_id,
        "variants_count": len(session["variants"]),
        "status": "ready",
    }
