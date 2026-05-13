from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class MediaSize(BaseModel):
    name: str
    width: int
    height: int
    description: str
    platform: str


class CreativeInput(BaseModel):
    product_name: str
    product_description: str
    target_audience: str
    campaign_goal: str
    brand_tone: Optional[str] = "전문적이고 신뢰감 있는"
    key_message: Optional[str] = None
    include_video: bool = False


class ConceptVariant(BaseModel):
    id: int
    appeal_type: str
    concept_title: str
    headline: str
    subheadline: str
    cta: str
    image_prompt: str
    description: str
    color_scheme: str


class GeneratedCreative(BaseModel):
    variant_id: int
    appeal_type: str
    concept_title: str
    headline: str
    subheadline: str
    cta: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    description: str
    color_scheme: str


class GenerateResponse(BaseModel):
    session_id: str
    creatives: List[GeneratedCreative]
    status: str


class DownloadRequest(BaseModel):
    session_id: str
    variant_id: int
    size_name: str
    format: str = "image"


MEDIA_SIZES = [
    MediaSize(name="insta_feed", width=1080, height=1080, description="인스타그램 피드", platform="Instagram"),
    MediaSize(name="insta_story", width=1080, height=1920, description="인스타그램 스토리/릴스", platform="Instagram"),
    MediaSize(name="fb_feed", width=1200, height=628, description="페이스북 피드", platform="Facebook"),
    MediaSize(name="fb_story", width=1080, height=1920, description="페이스북 스토리", platform="Facebook"),
    MediaSize(name="tiktok", width=1080, height=1920, description="틱톡 영상", platform="TikTok"),
    MediaSize(name="yt_thumbnail", width=1280, height=720, description="유튜브 썸네일", platform="YouTube"),
    MediaSize(name="banner_pc", width=728, height=90, description="PC 리더보드 배너", platform="Display"),
    MediaSize(name="banner_rect", width=300, height=250, description="미디엄 레크탱글", platform="Display"),
    MediaSize(name="banner_wide", width=970, height=250, description="빌보드 배너", platform="Display"),
    MediaSize(name="kakao_feed", width=800, height=800, description="카카오 피드", platform="Kakao"),
    MediaSize(name="naver_da", width=1200, height=300, description="네이버 DA", platform="Naver"),
    MediaSize(name="custom", width=0, height=0, description="커스텀 사이즈", platform="Custom"),
]
