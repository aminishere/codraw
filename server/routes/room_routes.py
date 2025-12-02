from fastapi import APIRouter, HTTPException
import uuid
from schemas.room_schemas import CreateRoomRequest, JoinRoomRequest, RoomResponse
from services.redis_manager import redis_manager

router = APIRouter(prefix="/api", tags=["rooms"])

@router.post("/create-room", response_model=RoomResponse)
async def create_room(request: CreateRoomRequest):
    try:
        player_name = request.playerName
        if not player_name:
            raise HTTPException(status_code=400, detail="Player name is required")
        
        room_id = str(uuid.uuid4())[:8]
        room_data = redis_manager.create_room(room_id, player_name)
        
        return RoomResponse(
            roomId=room_id,
            player1=player_name,
            player2=None,
            status=room_data["status"],
            roomUrl=f"/game/{room_id}",
            message="Room created successfully! Share the room ID with your friend."
        )
    except Exception as e:
        print(f"Error creating room: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/join-room", response_model=RoomResponse)
async def join_room(request: JoinRoomRequest):
    try:
        player_name = request.playerName
        room_id = request.roomId
        
        if not player_name or not room_id:
            raise HTTPException(status_code=400, detail="Player name and room ID are required")
        
        room = redis_manager.get_room(room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        success = redis_manager.join_room(room_id, player_name)
        if not success:
            raise HTTPException(status_code=400, detail="Room is full or doesn't exist")
        
        updated_room = redis_manager.get_room(room_id)
        
        return RoomResponse(
            roomId=room_id,
            player1=updated_room["player1"],
            player2=player_name,
            status=updated_room["status"],
            roomUrl=f"/game/{room_id}",
            message="Successfully joined the room!"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error joining room: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/room/{room_id}/exists")
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