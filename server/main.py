from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid
from datetime import datetime
from pydantic import BaseModel

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

# In-memory storage
rooms = {}

@app.post("/create-room")
async def create_room(request: CreateRoomRequest):
    room_id = str(uuid.uuid4())[:8]
    
    rooms[room_id] = {
        "player1": request.playerName,
        "player2": None,
        "created_at": datetime.now(),
        "drawing_data": [],
        "status": "waiting"
    }
    
    return {
        "roomId": room_id,
        "roomUrl": f"http://localhost:3000/game/{room_id}",
        "player1": request.playerName,
        "message": "Room created successfully"
    }

@app.post("/join-room")
async def join_room(request: JoinRoomRequest):
    if request.roomId not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = rooms[request.roomId]
    
    if room["player2"] is not None:
        raise HTTPException(status_code=400, detail="Room is full")
    
    room["player2"] = request.playerName
    room["status"] = "playing"
    
    return {
        "success": True,
        "roomId": request.roomId,
        "players": {
            "player1": room["player1"],
            "player2": request.playerName
        },
        "message": "Successfully joined room"
    }

@app.get("/room/{room_id}/exists")
async def check_room_exists(room_id: str):
    exists = room_id in rooms
    return {"exists": exists}