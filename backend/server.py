from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from database import init_db, admin_users_collection
from routes import public, admin
from auth import get_password_hash


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI(title="Rubber Track Wholesale API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Include public routes
api_router.include_router(public.router, tags=["Public"])

# Include admin routes
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])

# Health check
@api_router.get("/")
async def root():
    return {"message": "Rubber Track Wholesale API is running", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)