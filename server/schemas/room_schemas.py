from pydantic import BaseModel

class CreateRoomRequest(BaseModel):
    playerName: str

class JoinRoomRequest(BaseModel):
    playerName: str
    roomId: str

class RoomResponse(BaseModel):
    roomId: str
    player1: str
    player2: str | None
    status: str
    roomUrl: str
    message: str