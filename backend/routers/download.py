from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from models.schemas import DownloadRequest, MEDIA_SIZES
from services.resize_service import resize_image_for_media
from services.video_service import generate_video_from_image
import os

router = APIRouter(prefix="/api/download", tags=["download"])

from routers.generate import sessions


@router.post("")
async def download_creative(req: DownloadRequest):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = sessions[req.session_id]
    variant = session["variants"].get(req.variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    image_path = session["image_paths"].get(req.variant_id)
    if not image_path or not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found")

    output_dir = f"output/{req.session_id}"
    os.makedirs(output_dir, exist_ok=True)

    if req.format == "video":
        video_path = await generate_video_from_image(image_path, req.session_id, req.variant_id)
        if not video_path:
            raise HTTPException(status_code=500, detail="Video generation failed")

        # Determine file extension
        ext = "mp4" if video_path.endswith(".mp4") else "gif"
        sized_path = f"{output_dir}/variant_{req.variant_id}_{req.size_name}_video.{ext}"

        if ext == "gif":
            # Resize GIF
            from PIL import Image
            img = Image.open(video_path)
            frames = []
            size_obj = next((s for s in MEDIA_SIZES if s.name == req.size_name), None)
            target_w = size_obj.width if size_obj else 1080
            target_h = size_obj.height if size_obj else 1080
            try:
                while True:
                    frame = img.copy().convert("RGB")
                    frame = frame.resize((target_w, target_h), Image.LANCZOS)
                    frames.append(frame.convert("P", palette=Image.ADAPTIVE))
                    img.seek(img.tell() + 1)
            except EOFError:
                pass
            frames[0].save(sized_path, save_all=True, append_images=frames[1:], loop=0, duration=80)
        else:
            import shutil
            shutil.copy(video_path, sized_path)

        return FileResponse(
            sized_path,
            media_type=f"video/{ext}" if ext == "mp4" else "image/gif",
            filename=f"creative_{req.variant_id}_{req.size_name}.{ext}",
        )

    # Image download with resize
    sized_path = f"{output_dir}/variant_{req.variant_id}_{req.size_name}.png"
    resize_image_for_media(image_path, req.size_name, sized_path, variant)

    return FileResponse(
        sized_path,
        media_type="image/png",
        filename=f"creative_{variant.appeal_type}_{req.size_name}.png",
    )


@router.get("/sizes")
async def get_media_sizes():
    return {"sizes": [s.model_dump() for s in MEDIA_SIZES]}
