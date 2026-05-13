from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

load_dotenv()

from routers import generate, download

app = FastAPI(title="AI Creative Generator", version="1.0.0")

# Production: allow Vercel domain + localhost
allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)
    # also allow the vercel preview URLs pattern
    allowed_origins.append("https://*.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

output_dir = os.getenv("OUTPUT_DIR", "output")
os.makedirs(output_dir, exist_ok=True)
app.mount("/api/files", StaticFiles(directory=output_dir), name="files")

app.include_router(generate.router)
app.include_router(download.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "AI Creative Generator"}
