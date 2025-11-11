from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RoomRequest(BaseModel):
    name : str

class JoinRequest(BaseModel):
    name: str    

@app.post("/create-room")
def create_room(room_request  : RoomRequest):
    return {"nickname" : room_request.name}

@app.post("/join-room")
def join_room(join_req : JoinRequest):
    return {"name": join_req.name}