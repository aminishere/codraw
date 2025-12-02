from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid
from pydantic import BaseModel
from dotenv import load_dotenv
from routes.room_routes import router as room_router
from routes.websocket_routes import chat_ws

load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class CreateRoomRequest(BaseModel):
    playerName: str

class JoinRoomRequest(BaseModel):
    playerName: str
    roomId: str

# Include HTTP routes
app.include_router(room_router)

# Attach WebSocket route
app.websocket("/ws/game/{room_id}")(chat_ws)