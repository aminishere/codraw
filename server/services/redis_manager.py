import redis
import json
import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv
    

load_dotenv()

class RedisManager:
    def __init__(self):

        redis_url = os.getenv('REDIS_URL') 

        if not redis_url:
            raise ValueError("REDIS_URL not found")
        
        self.client = redis.from_url(redis_url, decode_responses=True)         # Create Redis connection

    def create_room(self, room_id: str, player1_name: str) -> Dict[str, Any]:
        """Create a new room with player1"""
        room_data = {
            "player1": player1_name,
            "player2": None,
            "status": "waiting",
            "drawing_data": [],
            "scores": {player1_name: 0},
            "current_turn": player1_name,
            "created_at": self._get_timestamp()
        }
        
        # TTL = 1hr
        self.client.setex(
            f"room:{room_id}",
            3600,
            json.dumps(room_data)
        )
        print(f" Room created: {room_id} for {player1_name}")
        return room_data

    def get_room(self, room_id: str) -> Optional[Dict[str, Any]]:
        """Get room data by ID"""
        data = self.client.get(f"room:{room_id}")
        if data:
            return json.loads(data)
        return None

    def join_room(self, room_id: str, player2_name: str) -> bool:
        """Add player2 to room"""
        room = self.get_room(room_id)
        if not room:
            print(f"Room {room_id} not found for joining")
            return False
        
        if room["player2"] is not None:
            print(f"Room {room_id} is already full")
            return False
        
        # Update room data
        room["player2"] = player2_name
        room["status"] = "playing"
        room["scores"][player2_name] = 0
        
        # Save back to Redis (reset TTL)
        self.client.setex(
            f"room:{room_id}",
            3600,
            json.dumps(room)
        )
        print(f"{player2_name} joined room: {room_id}")
        return True

    def update_room(self, room_id: str, updates: Dict[str, Any]) -> bool:
        """Update specific fields in room data"""
        room = self.get_room(room_id)
        if not room:
            return False
        
        # Merge updates
        room.update(updates)
        
        # Save back
        self.client.setex(
            f"room:{room_id}",
            3600,
            json.dumps(room)
        )
        return True

    def delete_room(self, room_id: str) -> bool:
        """Manually delete a room"""
        result = self.client.delete(f"room:{room_id}")
        if result:
            print(f"🗑️ Room deleted: {room_id}")
        return bool(result)

    def room_exists(self, room_id: str) -> bool:
        """Check if room exists"""
        return self.client.exists(f"room:{room_id}") == 1

    def get_all_rooms(self) -> Dict[str, Any]:
        """Get all rooms (for debugging)"""
        rooms = {}
        keys = self.client.keys("room:*")
        for key in keys:
            room_id = key.replace("room:", "")
            rooms[room_id] = self.get_room(room_id)
        return rooms

    def _get_timestamp(self) -> str:
        """Helper to get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()

# Global instance
redis_manager = RedisManager()