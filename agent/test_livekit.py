import asyncio
import os
import sys
import logging
from dotenv import load_dotenv
from livekit import api, rtc

load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

def validate_env_vars():
    """Validate required environment variables."""
    required_vars = {
        'LIVEKIT_URL': 'LiveKit server URL',
        'LIVEKIT_API_KEY': 'LiveKit API key',
        'LIVEKIT_API_SECRET': 'LiveKit API secret',
    }
    
    missing = []
    for var, description in required_vars.items():
        value = os.getenv(var)
        if not value:
            missing.append(f"{var} ({description})")
        else:
            # Log first part of sensitive values
            if var == 'LIVEKIT_URL':
                logger.info(f"{var}: {value}")
            else:
                logger.info(f"{var}: {value[:20]}...")
    
    if missing:
        logger.error(f"Missing environment variables:")
        for var in missing:
            logger.error(f"  - {var}")
        logger.info("\nAdd these to agent/.env.local")
        return False
    
    return True

async def test():
    """Test LiveKit connection."""
    logger.info("=" * 60)
    logger.info("LIVEKIT CONNECTION TEST")
    logger.info("=" * 60)
    
    # Validate environment variables
    if not validate_env_vars():
        logger.error("Environment validation failed")
        return False
    
    logger.info("\nAttempting connection...")
    
    try:
        # Generate test token
        token = api.AccessToken(
            api_key=os.getenv('LIVEKIT_API_KEY'),
            api_secret=os.getenv('LIVEKIT_API_SECRET')
        ).with_identity("test_agent") \
         .with_name("Test Agent") \
         .with_grants(api.VideoGrants(
            room_join=True,
            room="test_room",
            can_publish=True,
            can_subscribe=True,
        )).to_jwt()
        
        logger.info("Token generated successfully")
        
        # Connect to LiveKit
        room = rtc.Room()
        
        # Define event handlers
        def on_participant_connected(participant):
            logger.info(f"Participant connected: {participant.identity}")
        
        def on_disconnected():
            logger.info("Disconnected from room")
        
        # Attach event listeners
        room.on('participant_connected', on_participant_connected)
        room.on('disconnected', on_disconnected)
        
        await room.connect(os.getenv('LIVEKIT_URL'), token)
        logger.info(f"Connected to LiveKit!")
        logger.info(f"Room name: {room.name}")
        logger.info(f"Local participant: {room.local_participant.identity}")
        
        # Give room a moment to fully connect
        await asyncio.sleep(1)
        
        # Disconnect cleanly
        await room.disconnect()
        logger.info("Disconnected successfully")
        return True
        
    except ConnectionError as e:
        logger.error(f"Connection error: {e}")
        logger.error("Check that:")
        logger.error("  1. LiveKit URL is correct and accessible")
        logger.error("  2. API credentials are valid")
        logger.error("  3. LiveKit server is running")
        logger.error("  4. Firewall allows WebSocket connections")
        return False
    except Exception as e:
        logger.error(f"Test failed: {e}")
        logger.debug(f"Exception type: {type(e).__name__}")
        return False

async def main():
    """Main test entry point."""
    success = await test()
    
    logger.info("\n" + "=" * 60)
    if success:
        logger.info("LiveKit connection test PASSED")
        logger.info("Agent can connect to LiveKit")
        return 0
    else:
        logger.error("LiveKit connection test FAILED")
        logger.error("Fix issues above before running agent")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)