# AI Creative Generator - 설정 가이드

## 1. API 키 설정

`backend/.env` 파일을 열어 API 키를 입력하세요:

```
ANTHROPIC_API_KEY=sk-ant-...    ← Claude API 키
OPENAI_API_KEY=sk-...           ← OpenAI API 키 (DALL-E 3)
STABILITY_API_KEY=sk-...        ← Stability AI 키 (영상 생성, 선택)
```

### API 키 발급
- **Anthropic (Claude)**: https://console.anthropic.com
- **OpenAI (DALL-E 3)**: https://platform.openai.com
- **Stability AI (영상)**: https://platform.stability.ai (없으면 GIF로 대체)

---

## 2. 실행 방법

### 방법 A: 통합 시작 스크립트
```powershell
.\start.ps1
```

### 방법 B: 개별 실행
**백엔드 (터미널 1):**
```powershell
cd backend
.\venv\Scripts\uvicorn main:app --reload --port 8000
```

**프론트엔드 (터미널 2):**
```powershell
cd frontend
npm run dev
```

---

## 3. 접속 URL
- **서비스**: http://localhost:3000
- **API 문서**: http://localhost:8000/docs

---

## 4. 매체별 사이즈 지원
| 매체 | 사이즈 |
|------|--------|
| 인스타그램 피드 | 1080×1080 |
| 인스타그램 스토리 | 1080×1920 |
| 페이스북 피드 | 1200×628 |
| 틱톡 | 1080×1920 |
| 유튜브 썸네일 | 1280×720 |
| PC 배너 | 728×90 |
| 미디엄 레크탱글 | 300×250 |
| 빌보드 | 970×250 |
| 카카오 피드 | 800×800 |
| 네이버 DA | 1200×300 |
| 커스텀 | 직접 입력 |
