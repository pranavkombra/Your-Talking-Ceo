from livekit import api
import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Validate environment variables on startup
def validate_env_vars():
    """Validate that all required environment variables are set."""
    required_vars = ['LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET', 'LIVEKIT_URL']
    missing = [var for var in required_vars if not os.getenv(var)]
    
    if missing:
        error_msg = f"Missing environment variables: {', '.join(missing)}"
        logger.error(f"❌ {error_msg}")
        raise RuntimeError(error_msg)
    
    logger.info(f"✅ Environment variables validated")
    logger.info(f"   LIVEKIT_URL: {os.getenv('LIVEKIT_URL')}")
    logger.info(f"   LIVEKIT_API_KEY: {os.getenv('LIVEKIT_API_KEY')[:10]}...")

validate_env_vars()

def generate_room_token(
    room_name: str, 
    participant_identity: str,
    agent_name: str = None
) -> str:
    """Generates a JWT access token for joining a LiveKit room with optional agent dispatch."""
    try:
        token_builder = api.AccessToken(
            os.getenv('LIVEKIT_API_KEY'), 
            os.getenv('LIVEKIT_API_SECRET')
        ).with_identity(participant_identity) \
         .with_name(participant_identity) \
         .with_grants(api.VideoGrants(
             room_join=True,
             room=room_name,
             can_publish=True,
             can_publish_data=True,
             can_subscribe=True,
         ))
        
        # Add agent dispatch metadata if agent name is provided
        if agent_name:
            token_builder = token_builder.with_metadata(f'{{"agent_name":"{agent_name}"}}')
            logger.info(f"🤖 Agent dispatch enabled: {agent_name}")
        
        token = token_builder.to_jwt()
        logger.info(f"✅ Token generated for room: {room_name}, identity: {participant_identity}")
        return token
    except Exception as e:
        logger.error(f"❌ Token generation failed: {str(e)}")
        raise

@app.get("/token")
async def get_token(
    room_name: str = "maneuver-room",
    identity: str = "user",
    agent_name: str = None
):
    """Generate a LiveKit token for a participant."""
    try:
        if not room_name or not identity:
            raise ValueError("room_name and identity are required")
        
        token = generate_room_token(room_name, identity, agent_name)
        
        response = {
            "token": token,
            "url": os.getenv('LIVEKIT_URL'),
            "room": room_name,
            "identity": identity
        }
        
        if agent_name:
            response["agent"] = agent_name
        
        logger.info(f"📤 Token endpoint response: room={room_name}, identity={identity}")
        return response
    except Exception as e:
        logger.error(f"❌ Token endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "livekit_url": os.getenv('LIVEKIT_URL'),
        "has_credentials": bool(os.getenv('LIVEKIT_API_KEY'))
    }

if __name__ == "__main__":
    logger.info("🚀 Starting LiveKit Token Server")
    logger.info("✅ Token server running on http://localhost:8000")
    logger.info("   Token endpoint: http://localhost:8000/token")
    logger.info("   Health check: http://localhost:8000/health")
    uvicorn.run(app, host="0.0.0.0", port=8000)