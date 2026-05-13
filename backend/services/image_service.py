import os
import httpx
import asyncio
import urllib.parse
from models.schemas import ConceptVariant

# Pollinations.ai - 무료, API 키 불필요, FLUX 모델
POLLINATIONS_BASE = "https://image.pollinations.ai/prompt"


async def generate_image(variant: ConceptVariant, session_id: str) -> str:
    """Pollinations.ai (무료)로 이미지 생성 후 로컬 저장"""
    prompt = (
        f"{variant.image_prompt}. "
        f"Professional advertisement creative, clean commercial look, "
        f"color scheme: {variant.color_scheme}, "
        f"no text overlay, high quality, photorealistic"
    )
    encoded = urllib.parse.quote(prompt)
    # seed를 variant.id 기반으로 고정해 재현성 확보
    url = f"{POLLINATIONS_BASE}/{encoded}?width=1024&height=1024&model=flux&seed={variant.id * 7919}&nologo=true"

    local_path = await _download_and_save(url, session_id, variant.id)
    return local_path


async def _download_and_save(url: str, session_id: str, variant_id: int) -> str:
    base_output = os.getenv("OUTPUT_DIR", "output")
    output_dir = f"{base_output}/{session_id}"
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{output_dir}/variant_{variant_id}_original.png"

    async with httpx.AsyncClient(timeout=60.0) as http:
        resp = await http.get(url)
        resp.raise_for_status()
        with open(filename, "wb") as f:
            f.write(resp.content)

    return filename


async def generate_all_images(variants: list[ConceptVariant], session_id: str) -> dict[int, str]:
    """5개 이미지를 병렬로 생성"""
    tasks = [generate_image(v, session_id) for v in variants]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    paths = {}
    for i, (variant, result) in enumerate(zip(variants, results)):
        if isinstance(result, Exception):
            print(f"Image generation failed for variant {variant.id}: {result}")
            paths[variant.id] = None
        else:
            paths[variant.id] = result
    return paths
