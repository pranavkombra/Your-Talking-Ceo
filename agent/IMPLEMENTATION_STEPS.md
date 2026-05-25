# 🎯 Step-by-Step Implementation Checklist

Follow these steps in order. Each one builds on the previous.

---

## ✅ Phase 1: Setup (5 minutes)

### Step 1.1: Update Dependencies
```bash
cd agent
pip install -r requirements.txt --upgrade
```

**Expected output:**
```
Successfully installed livekit-plugins-openai
Successfully installed aiohttp
...
```

**If you get an error:**
- Make sure you're in the `/agent` directory
- Make sure Python 3.9+ is installed: `python --version`

### Step 1.2: Create .env File
```bash
cp .env.example .env
```

**Expected output:** No output (file created silently)

**Verify it worked:**
```bash
ls -la .env
```

Should show: `.env` file exists

### Step 1.3: Edit .env File
Open `agent/.env` and fill in all your API keys:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-actual-key
LIVEKIT_API_SECRET=your-actual-secret

DEEPGRAM_API_KEY=your-actual-key
GROQ_API_KEY=your-actual-key
CARTESIA_API_KEY=your-actual-key
OPENAI_API_KEY=your-actual-key
```

**⚠️ Important:** Use real keys, not the example text!

---

## ✅ Phase 2: Diagnostics (3 minutes)

### Step 2.1: Check Cartesia API Health
```bash
python cartesia_diagnostics.py
```

**Expected output:**
```
============================================================
CARTESIA API DIAGNOSTICS
============================================================
✅ Cartesia API responding
📊 Available voices: 15 total
   • Zara (ID: 95856005-0332-474b-929b-33e888e1e037)
   • Maya (ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
   • ...and 13 more
============================================================
✅ Cartesia is healthy and ready to use!
```

**If you see ❌ errors:**
| Error | Fix |
|-------|-----|
| `Invalid Cartesia API key (401)` | Check your CARTESIA_API_KEY in .env |
| `Rate limited by Cartesia (429)` | Your account hit quota limit - check Cartesia dashboard |
| `Cartesia API timeout` | Network issue - check your internet or firewall |

**If diagnostics pass:** Continue to Step 2.2

### Step 2.2: Test TTS Providers
```bash
python test_tts.py
```

**Expected output:**
```
============================================================
TTS CONFIGURATION TEST
============================================================
🧪 Testing Cartesia TTS...
   Synthesizing: 'Hello, this is a test message.'
✅ Cartesia TTS working (142 audio chunks)

🧪 Testing OpenAI TTS (fallback)...
   Synthesizing: 'Hello from OpenAI.'
✅ OpenAI TTS working (87 audio chunks)

============================================================
RESULTS:
============================================================
✅ Cartesia TTS: READY
✅ OpenAI TTS (fallback): READY

✅ All TTS providers working! Agent should be stable.
```

**If Cartesia is ❌ but OpenAI is ✅:**
- This means Cartesia is having issues
- Your fallback will work but you should investigate
- Run `python cartesia_diagnostics.py` to see what's wrong

**If OpenAI is ❌:**
- Make sure OPENAI_API_KEY is in .env and correct
- Check your OpenAI account has credits

**If both fail:** Stop and troubleshoot with TTS_TROUBLESHOOTING.md before proceeding

---

## ✅ Phase 3: Customization (Optional)

### Step 3.1 (Optional): Choose a Different Cartesia Voice

If you want a different voice than the default "Zara":

1. Run diagnostics again to see available voices:
```bash
python cartesia_diagnostics.py
```

2. Find a voice you like from the list
3. Edit `.env` and add the voice ID:
```env
CARTESIA_VOICE_ID=copy-the-id-from-diagnostics
```

Example:
```env
CARTESIA_VOICE_ID=95856005-0332-474b-929b-33e888e1e037
```

4. Verify it's working:
```bash
python test_tts.py
```

---

## ✅ Phase 4: Launch Agent (2 minutes)

### Step 4.1: Start Development Server
```bash
python main.py dev
```

**Expected output (in first 10 seconds):**
```
...
🔄 Prewarming worker process - loading VAD model...
✅ VAD model loaded successfully
...
📋 API Keys Status: {'DEEPGRAM_API_KEY': True, 'GROQ_API_KEY': True, 'CARTESIA_API_KEY': True, ...}
...
📝 Lead store initialized
🎤 Initializing voice pipeline...
📢 Using default Cartesia voice (Zara). To use different voice: CARTESIA_VOICE_ID=your-voice-id
✅ Voice pipeline created
✅ Agent instance created
🔗 Starting session.start()...
✅ session.start() completed successfully
✅ Agent connected and waiting in room: voice_assistant_room_1324
🗣️ Agent speaking opening line...
✅ Opening line delivered
```

**If you see these ✅ messages:** Success! Agent is ready.

**If you see ❌ errors:** Check [Phase 5: Troubleshooting](#-phase-5-troubleshooting)

### Step 4.2: Connect and Test
- Open the frontend (usually http://localhost:3000 or from your setup)
- Join the voice room
- Agent should greet you with opening line
- Speak to test

---

## ✅ Phase 5: Troubleshooting

### Problem: "OPENAI_API_KEY not set"
**Solution:**
1. Edit `.env` and add: `OPENAI_API_KEY=your-key-here`
2. Restart: `python main.py dev`

### Problem: "no audio frames were pushed"
**Solution:**
1. Run diagnostics: `python cartesia_diagnostics.py`
2. If it fails, see Phase 2.1 fixes above
3. If it passes but agent still fails:
   - Check OPENAI_API_KEY is set (fallback might save you)
   - Check Cartesia dashboard for account status
   - Try a different voice ID

### Problem: Agent crashes after a few messages
**Solution:**
1. Make sure OPENAI_API_KEY is configured
2. Run `python test_tts.py` to verify both providers work
3. Check Cartesia quota in dashboard
4. If Cartesia is struggling, temporarily switch to OpenAI-only:

Edit `agent/main.py` around line 138, replace the TTS section with:
```python
tts=openai.TTS(voice="fable", speed=1.0),
```

### Problem: Voice sounds weird or different
**Solution:** This is normal! It means:
- Cartesia failed
- Fallback to OpenAI kicked in
- The voice changed because it's a different provider
- This is intentional to keep the call going

To use only one voice, switch to OpenAI-only mode (see above)

### Still having issues?
1. Read `TTS_TROUBLESHOOTING.md` for detailed help
2. Check `CHANGES_SUMMARY.md` for what was modified
3. Run `python cartesia_diagnostics.py` to diagnose

---

## ✅ Success Criteria

You're done when:
- [ ] `python cartesia_diagnostics.py` shows ✅
- [ ] `python test_tts.py` shows ✅ for both providers
- [ ] `python main.py dev` shows `✅ Voice pipeline created`
- [ ] Agent greets you when you join
- [ ] You can have a conversation without crashes
- [ ] Voice is continuous (not randomly breaking)

---

## 📊 Validation

```bash
# All-in-one validation
cd agent

echo "1. Testing dependencies..."
python -c "from livekit.plugins import cartesia, openai, deepgram, groq; print('✅ All imports work')"

echo -e "\n2. Testing Cartesia..."
python cartesia_diagnostics.py

echo -e "\n3. Testing both TTS providers..."
python test_tts.py

echo -e "\n4. Ready to start agent!"
echo "Run: python main.py dev"
```

---

## ⏱️ Estimated Time

- Phase 1 (Setup): 5 minutes
- Phase 2 (Diagnostics): 3 minutes  
- Phase 3 (Customization): 2 minutes (optional)
- Phase 4 (Launch): 2 minutes
- Phase 5 (Troubleshooting): As needed

**Total: 12-14 minutes to get stable agent running**

---

## 🎉 You're All Set!

Once you see:
```
✅ Voice pipeline created
✅ Agent connected and waiting
```

Your agent is ready and **much more stable** than before.

The fallback TTS means even if Cartesia has issues, the call continues. Enjoy! 🚀
