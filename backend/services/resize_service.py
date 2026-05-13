from PIL import Image, ImageDraw, ImageFont
import os
from models.schemas import MEDIA_SIZES, ConceptVariant


def get_size_by_name(size_name: str, custom_width: int = 0, custom_height: int = 0):
    if size_name == "custom":
        return custom_width, custom_height
    for s in MEDIA_SIZES:
        if s.name == size_name:
            return s.width, s.height
    return 1080, 1080


def resize_image_for_media(
    source_path: str,
    size_name: str,
    output_path: str,
    variant: ConceptVariant,
    custom_width: int = 0,
    custom_height: int = 0,
) -> str:
    target_w, target_h = get_size_by_name(size_name, custom_width, custom_height)

    img = Image.open(source_path).convert("RGB")
    src_w, src_h = img.size
    src_ratio = src_w / src_h
    target_ratio = target_w / target_h

    # Center crop to fill target ratio
    if src_ratio > target_ratio:
        new_h = src_h
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        img = img.crop((left, 0, left + new_w, new_h))
    else:
        new_w = src_w
        new_h = int(src_w / target_ratio)
        top = (src_h - new_h) // 2
        img = img.crop((0, top, new_w, top + new_h))

    img = img.resize((target_w, target_h), Image.LANCZOS)

    # Add text overlay
    img = _add_text_overlay(img, variant, target_w, target_h)

    img.save(output_path, "PNG", optimize=True)
    return output_path


def _add_text_overlay(img: Image.Image, variant: ConceptVariant, width: int, height: int) -> Image.Image:
    """헤드라인, 서브헤드, CTA 버튼 오버레이"""
    # Skip text for very small banner sizes
    if width <= 300 and height <= 90:
        return img

    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Bottom gradient bar
    bar_height = int(height * 0.35)
    for y in range(bar_height):
        alpha = int(200 * (y / bar_height))
        draw.rectangle([(0, height - bar_height + y), (width, height - bar_height + y + 1)], fill=(0, 0, 0, alpha))

    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Font sizes based on image dimensions
    headline_size = max(int(width * 0.055), 16)
    sub_size = max(int(width * 0.03), 12)
    cta_size = max(int(width * 0.028), 11)

    try:
        font_headline = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", headline_size)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", sub_size)
        font_cta = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", cta_size)
    except Exception:
        font_headline = ImageFont.load_default()
        font_sub = font_headline
        font_cta = font_headline

    padding = int(width * 0.05)
    bottom = height - padding

    # CTA button
    cta_text = variant.cta
    cta_bbox = draw.textbbox((0, 0), cta_text, font=font_cta)
    cta_w = cta_bbox[2] - cta_bbox[0] + int(width * 0.06)
    cta_h = cta_bbox[3] - cta_bbox[1] + int(height * 0.025)
    cta_x = padding
    cta_y = bottom - cta_h
    draw.rounded_rectangle([cta_x, cta_y, cta_x + cta_w, cta_y + cta_h], radius=8, fill="#FF5722")
    draw.text((cta_x + int(width * 0.03), cta_y + int(height * 0.012)), cta_text, font=font_cta, fill="white")

    # Subheadline
    sub_y = cta_y - int(height * 0.04) - sub_size
    draw.text((padding, sub_y), variant.subheadline, font=font_sub, fill=(220, 220, 220))

    # Headline
    hl_y = sub_y - int(height * 0.025) - headline_size
    draw.text((padding, hl_y), variant.headline, font=font_headline, fill="white")

    return img
