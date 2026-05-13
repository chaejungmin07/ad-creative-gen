import os
import httpx
import asyncio
import base64
from PIL import Image
import io

STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")


async def generate_video_from_image(image_path: str, session_id: str, variant_id: int) -> str | None:
    """Stability AI img2vid API로 이미지를 영상으로 변환"""
    if not STABILITY_API_KEY:
        return await _create_animated_fallback(image_path, session_id, variant_id)

    try:
        with open(image_path, "rb") as f:
            image_data = f.read()

        # Stability AI img2vid endpoint
        async with httpx.AsyncClient(timeout=120.0) as http:
            response = await http.post(
                "https://api.stability.ai/v2beta/image-to-video",
                headers={"authorization": f"Bearer {STABILITY_API_KEY}"},
                data={
                    "seed": 0,
                    "cfg_scale": 1.8,
                    "motion_bucket_id": 127,
                },
                files={"image": ("image.png", image_data, "image/png")},
            )

            if response.status_code != 200:
                print(f"Stability API error: {response.status_code} {response.text}")
                return await _create_animated_fallback(image_path, session_id, variant_id)

            generation_id = response.json().get("id")

        # Poll for result
        video_path = await _poll_video_result(generation_id, session_id, variant_id)
        return video_path

    except Exception as e:
        print(f"Video generation error: {e}")
        return await _create_animated_fallback(image_path, session_id, variant_id)


async def _poll_video_result(generation_id: str, session_id: str, variant_id: int) -> str | None:
    output_dir = f"output/{session_id}"
    os.makedirs(output_dir, exist_ok=True)
    video_path = f"{output_dir}/variant_{variant_id}_video.mp4"

    max_attempts = 30
    for attempt in range(max_attempts):
        await asyncio.sleep(10)
        async with httpx.AsyncClient(timeout=30.0) as http:
            response = await http.get(
                f"https://api.stability.ai/v2beta/image-to-video/result/{generation_id}",
                headers={
                    "authorization": f"Bearer {STABILITY_API_KEY}",
                    "accept": "video/*",
                },
            )

            if response.status_code == 200:
                with open(video_path, "wb") as f:
                    f.write(response.content)
                return video_path
            elif response.status_code == 202:
                continue  # Still processing
            else:
                return None

    return None


async def _create_animated_fallback(image_path: str, session_id: str, variant_id: int) -> str:
    """Stability API 없을 때 애니메이션 GIF 생성 (fallback)"""
    output_dir = f"output/{session_id}"
    os.makedirs(output_dir, exist_ok=True)
    gif_path = f"{output_dir}/variant_{variant_id}_animated.gif"

    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    frames = []

    # 줌인 효과 (Ken Burns effect)
    for i in range(30):
        scale = 1.0 + (i * 0.005)
        new_w = int(width * scale)
        new_h = int(height * scale)
        resized = img.resize((new_w, new_h), Image.LANCZOS)
        left = (new_w - width) // 2
        top = (new_h - height) // 2
        cropped = resized.crop((left, top, left + width, top + height))
        frames.append(cropped.convert("P", palette=Image.ADAPTIVE, dither=0))

    frames[0].save(
        gif_path,
        save_all=True,
        append_images=frames[1:],
        optimize=False,
        duration=80,
        loop=0,
    )
    return gif_path
