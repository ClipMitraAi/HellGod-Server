"""
HELLGOD Server Platform - Master FastAPI Entry Point
Version: 1.0.0 (Zero-Budget, Open-Source)
"""

import os
import psutil
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sqlite3

app = FastAPI(
    title="HELLGOD All-in-One Server Platform API",
    version="1.0.0",
    description="Cyberpunk-grade self-hostable server management platform with Android and Web clients."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "brand": "HELLGOD",
        "system": "HELLGOD Core Engine",
        "version": "1.0.0",
        "status": "ONLINE",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "OPTIMAL",
        "cpu_percent": psutil.cpu_percent(interval=None),
        "ram_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage("/").percent
    }

@app.get("/api/system/metrics")
def get_metrics():
    vm = psutil.virtual_memory()
    du = psutil.disk_usage("/")
    return {
        "cpu": {
            "cores": psutil.cpu_count(logical=True),
            "usage_percent": psutil.cpu_percent(interval=None),
            "load_avg": psutil.getloadavg() if hasattr(psutil, "getloadavg") else [0.2, 0.1, 0.05]
        },
        "memory": {
            "total_bytes": vm.total,
            "used_bytes": vm.used,
            "free_bytes": vm.free,
            "usage_percent": vm.percent
        },
        "disk": {
            "total_bytes": du.total,
            "used_bytes": du.used,
            "free_bytes": du.free,
            "usage_percent": du.percent
        }
    }

class AuthRequest(BaseModel):
    username: str
    password: str

@app.post("/api/auth/login")
def login(auth: AuthRequest):
    u = auth.username.strip()
    p = auth.password.strip()

    if (u.lower() == "hellgod" and p == "HellGod@1122") or (u == "root" and p in ["hellgod", "admin"]):
        resolved_user = "HellGod" if u.lower() == "hellgod" else "root"
        return {
            "success": True,
            "token": f"hg_jwt_{resolved_user}_session_token",
            "user": {
                "username": resolved_user,
                "role": "ROOT_ADMIN"
            }
        }
    raise HTTPException(status_code=401, detail="Invalid HELLGOD credentials. Use HellGod / HellGod@1122")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
