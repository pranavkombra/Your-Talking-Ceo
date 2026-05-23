from livekit import api
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_room_token(room_name: str, participant_identity: str) -> str:
    """Generates a JWT access token for joining a LiveKit room."""
    token = api.AccessToken(
        os.getenv('LIVEKIT_API_KEY'), 
        os.getenv('LIVEKIT_API_SECRET')
    ).with_identity(participant_identity) \
     .with_name(participant_identity) \
     .with_grants(api.VideoGrants(
         room_join=True,
         room=room_name,
         can_publish=True,
         can_subscribe=True,
     )).to_jwt()
    return token

@app.get("/token")
async def get_token(
    room_name: str = "maneuver-room",
    identity: str = "user"
):
    token = generate_room_token(room_name, identity)
    return {
        "token": token,
        "url": os.getenv('LIVEKIT_URL'),
        "room": room_name
    }

if __name__ == "__main__":
    print("✅ Token server running on http://localhost:8000/token")
    uvicorn.run(app, host="0.0.0.0", port=8000)