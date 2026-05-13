# AI Creative Generator 시작 스크립트
Write-Host "=== AI 소재 자동 생성 시스템 시작 ===" -ForegroundColor Cyan

# 백엔드 시작
Write-Host "`n[1/2] FastAPI 백엔드 시작 중..." -ForegroundColor Yellow
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000" -PassThru

Start-Sleep -Seconds 3

# 프론트엔드 시작
Write-Host "[2/2] Next.js 프론트엔드 시작 중..." -ForegroundColor Yellow
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev" -PassThru

Write-Host "`n✅ 서버 시작 완료!" -ForegroundColor Green
Write-Host "   - 프론트엔드: http://localhost:3000" -ForegroundColor White
Write-Host "   - 백엔드 API: http://localhost:8000" -ForegroundColor White
Write-Host "   - API 문서:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "`n종료하려면 각 창을 닫거나 Ctrl+C를 누르세요." -ForegroundColor Gray
