import { NextResponse } from "next/server";

export const MEDIA_SIZES = [
  { name: "insta_feed",   width: 1080, height: 1080, description: "인스타그램 피드",      platform: "Instagram" },
  { name: "insta_story",  width: 1080, height: 1920, description: "인스타그램 스토리/릴스", platform: "Instagram" },
  { name: "fb_feed",      width: 1200, height: 628,  description: "페이스북 피드",         platform: "Facebook"  },
  { name: "fb_story",     width: 1080, height: 1920, description: "페이스북 스토리",        platform: "Facebook"  },
  { name: "tiktok",       width: 1080, height: 1920, description: "틱톡 영상",             platform: "TikTok"    },
  { name: "yt_thumbnail", width: 1280, height: 720,  description: "유튜브 썸네일",          platform: "YouTube"   },
  { name: "banner_pc",    width: 728,  height: 90,   description: "PC 리더보드 배너",       platform: "Display"   },
  { name: "banner_rect",  width: 300,  height: 250,  description: "미디엄 레크탱글",        platform: "Display"   },
  { name: "banner_wide",  width: 970,  height: 250,  description: "빌보드 배너",            platform: "Display"   },
  { name: "kakao_feed",   width: 800,  height: 800,  description: "카카오 피드",            platform: "Kakao"     },
  { name: "naver_da",     width: 1200, height: 300,  description: "네이버 DA",             platform: "Naver"     },
  { name: "custom",       width: 0,    height: 0,    description: "커스텀 사이즈",           platform: "Custom"    },
];

export async function GET() {
  return NextResponse.json({ sizes: MEDIA_SIZES });
}
