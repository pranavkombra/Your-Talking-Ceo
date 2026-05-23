import asyncio
import os
from dotenv import load_dotenv
from livekit import api, rtc

load_dotenv()

async def test():
    print(f"URL: {os.getenv('LIVEKIT_URL')}")
    print(f"API Key: {os.getenv('LIVEKIT_API_KEY')[:20]}...")
    
    token = api.AccessToken(
        api_key=os.getenv('LIVEKIT_API_KEY'),
        api_secret=os.getenv('LIVEKIT_API_SECRET')
    ).with_identity("test").to_jwt()
    
    room = rtc.Room()
    try:
        await room.connect(os.getenv('LIVEKIT_URL'), token)
        print("✅ CONNECTED!")
        await room.disconnect()
    except Exception as e:
        print(f"❌ ERROR: {e}")

asyncio.run(test())