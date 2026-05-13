import openai
import os
import httpx
import asyncio
from models.schemas import ConceptVariant

client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def generate_image(variant: ConceptVariant, session_id: str) -> str:
    """DALL-E 3으로 이미지 생성 후 로컬 저장, URL 반환"""
    enhanced_prompt = f"""Professional advertisement creative image for Korean market.
{variant.image_prompt}
Style: Clean, modern advertising photography or illustration. High-quality commercial look.
Color scheme: {variant.color_scheme}.
No text overlays. Suitable for digital display advertising.
Ultra-realistic, professional commercial photography style."""

    response = await client.images.generate(
        model="dall-e-3",
        prompt=enhanced_prompt,
        size="1024x1024",
        quality="standard",
        n=1,
    )

    image_url = response.data[0].url
    local_path = await _download_and_save(image_url, session_id, variant.id)
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
