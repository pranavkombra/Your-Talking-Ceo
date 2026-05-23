"""Check all API keys are properly configured"""

import os
from dotenv import load_dotenv

load_dotenv()

print("=" * 50)
print("API KEY STATUS CHECK")
print("=" * 50)

apis = [
    ("GROQ_API_KEY", os.getenv("GROQ_API_KEY")),
    ("DEEPGRAM_API_KEY", os.getenv("DEEPGRAM_API_KEY")),
    ("CARTESIA_API_KEY", os.getenv("CARTESIA_API_KEY")),
    ("LIVEKIT_URL", os.getenv("LIVEKIT_URL")),
    ("LIVEKIT_API_KEY", os.getenv("LIVEKIT_API_KEY")),
    ("LIVEKIT_API_SECRET", os.getenv("LIVEKIT_API_SECRET")),
]

for name, value in apis:
    status = "✅ OK" if value else "❌ MISSING"
    # Show first 20 chars of keys for verification
    display = value[:20] + "..." if value and len(value) > 25 else value or ""
    print(f"{name:25} {status}  {display}")

print("=" * 50)
active = sum(1 for _, v in apis if v)
print(f"TOTAL: {active}/6 ACTIVE")
print("=" * 50)

if active == 6:
    print("✅ All APIs ready! You can run the agent.")
else:
    print("❌ Missing APIs. Check your .env file.")