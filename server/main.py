from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid
from datetime import datetime
from pydantic import BaseModel
from dotenv import load_dotenv

from services.redis_manager import redis_manager

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

@app.post("/create-room")
async def create_room(request: CreateRoomRequest):

    try:
        player_name = request.playerName
        if not player_name:
            raise HTTPException(status_code=400, detail="Player name is required")
        
        room_id = str(uuid.uuid4())[:8]  # Short unique ID
        
        room_data = redis_manager.create_room(room_id, player_name)
        
        return {
            "roomId": room_id,
            "player1": player_name,
            "player2": None,
            "status": room_data["status"],
            "roomUrl": f"/game/{room_id}",
            "message": "Room created successfully! Share the room ID with your friend."
        }
    except Exception as e:
        print(f"Error creating room: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/join-room")
async def join_room(request: JoinRoomRequest):
    """Join an existing room as player 2"""
    try:
        player_name = request.playerName
        room_id = request.roomId
        
        if not player_name or not room_id:
            raise HTTPException(status_code=400, detail="Player name and room ID are required")
        
        room = redis_manager.get_room(room_id)        # Check if room exists
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        success = redis_manager.join_room(room_id, player_name)        # Try to join room
        if not success:
            raise HTTPException(status_code=400, detail="Room is full or doesn't exist")
        

        updated_room = redis_manager.get_room(room_id)        # Get updated room data
        
        return {
            "success": True,
            "roomId": room_id,
            "player1": updated_room["player1"],
            "player2": player_name,
            "status": updated_room["status"],
            "roomUrl": f"/game/{room_id}",
            "message": "Successfully joined the room!"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error joining room: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/room/{room_id}/exists")
async def check_room_exists(room_id: str):

    try:
        room = redis_manager.get_room(room_id)
        if not room:
            return {"exists": False}
        
        return {
            "exists": True,
            "status": room["status"],
            "player1": room["player1"],
            "player2": room["player2"]
        }
    except Exception as e:
        print(f"Error checking room: {e}")
        return {"exists": False}