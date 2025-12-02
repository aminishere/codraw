from collections import defaultdict
from typing import List, Dict
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        self.active_connections : Dict[str, List[WebSocket]] = defaultdict(list)

    async def connect(self, room_id: str, websocket: WebSocket):
        self.active_connections[room_id].append(websocket)

    async def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_connections:
            if websocket in self. active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)

            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, room_id: str, message: dict, sender_ws: WebSocket=None):
        if room_id not in self.active_connections:
            return
        dead_connections = []

        for connection in self.active_connections[room_id]:
            if sender_ws and connection== sender_ws:
                continue
            try:
                await connection.send_json(message)
            except:
                dead_connections.append(connection)

        for dead_con in dead_connections:
            await self.disconnect(room_id, dead_con)

ws_manager = WebSocketManager()
                    



