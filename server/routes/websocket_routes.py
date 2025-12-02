from fastapi import WebSocket, WebSocketDisconnect
from services.websocket_manager import ws_manager
from services.redis_manager import redis_manager

# WebSocket function - will be attached to app in main.py
async def chat_ws(websocket: WebSocket, room_id: str):
    await websocket.accept()

    player_name = None
    try:
        auth_data = await websocket.receive_json()
        player_name = auth_data.get("playerName")

        if not player_name:
            await websocket.close(code=1008, reason="Player name required!")
            return
        
        room = redis_manager.get_room(room_id)
        if not room:
            await websocket.close(code=1008, reason="No room found")
            return
        
        await ws_manager.connect(room_id, websocket)

        await ws_manager.broadcast(
            room_id=room_id,
            message={
                "type": "system",
                "message": f"{player_name} joined the room",
                "player": player_name,
                "event": "player_joined"
            },
            sender_ws=websocket
        )
        
        while True:
            data = await websocket.receive_json()
            message_content = data.get("message", "").strip()
            if not message_content:
                continue

            await ws_manager.broadcast(
                room_id=room_id,
                message={
                    "type": "chat",
                    "sender": player_name,
                    "message": message_content,
                    "timestamp": "now"
                },
                sender_ws=websocket
            )
            
    except WebSocketDisconnect:
        print(f"WebSocket disconnected: {player_name} from room {room_id}")

    except Exception as e:
        print(f"WebSocket error for {player_name}: {e}")

    finally:
        if player_name:
            await ws_manager.broadcast(
                room_id=room_id,
                message={
                    "type": "system",
                    "message": f"{player_name} left the chat",
                    "player": player_name,
                    "event": "player_left"
                }
            )
        
        await ws_manager.disconnect(room_id, websocket)