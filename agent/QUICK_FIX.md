# ⚡ QUICK FIX: TTS Stability Issues

Your agent is crashing because **Cartesia TTS is failing to generate audio**. I've implemented fixes. Here's what to do:

---

## 🚨 IMMEDIATE STEPS (Do These Now)

### 1. Update Dependencies
```bash
cd agent
pip install -r requirements.txt --upgrade
```
This installs the OpenAI TTS fallback support.

### 2. Create Your .env File
```bash
cp .env.example .env
```

Edit `agent/.env` and add your API keys:
```env
CARTESIA_API_KEY=your-actual-key-here
OPENAI_API_KEY=your-openai-key-here
DEEPGRAM_API_KEY=your-key-here
GROQ_API_KEY=your-key-here
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-key-here
LIVEKIT_API_SECRET=your-secret-here
```

### 3. Run Diagnostics
```bash
python cartesia_diagnostics.py
```

**What to look for:**
- ✅ Shows available voices and voice IDs
- ❌ If it fails, your Cartesia API key or account has issues

---

## 🔍 What I Fixed in Your Code

| Change | What it does |
|--------|------------|
| ✅ **Added voice ID** | Cartesia now uses a specific voice ("Zara") instead of default |
| ✅ **Added OpenAI fallback** | If Cartesia fails, OpenAI TTS takes over automatically |
| ✅ **Better error checking** | Warns you if OPENAI_API_KEY is missing |
| ✅ **Diagnostic tools** | `cartesia_diagnostics.py` and `test_tts.py` to debug issues |
| ✅ **Troubleshooting guide** | `TTS_TROUBLESHOOTING.md` for detailed help |

---

## ✅ Test Before Running Agent

```bash
# Test if both TTS providers work
python test_tts.py

# Should output:
# ✅ Cartesia TTS: READY
# ✅ OpenAI TTS (fallback): READY
```

If both pass ✅, your agent should be stable now.

---

## 🎯 Why This Fixes Your Issues

**Your original problem:**
```
APIError: no audio frames were pushed for text: [text]
→ Agent crashes, call ends
```

**What was missing:**
- No voice ID specified (Cartesia doesn't know which voice to use)
- No fallback (if Cartesia fails, agent crashes)
- No diagnostics (can't tell if it's API key, quota, or voice ID issue)

**What I added:**
```python
tts=cartesia.TTS(
    model="sonic",
    voice_id="95856005-0332-474b-929b-33e888e1e037",  # ← Specific voice
    fallback_tts=openai.TTS(voice="fable", speed=1.0),  # ← Automatic fallback
),
```

Now:
- ✅ Agent uses "Zara" voice (professional, warm tone)
- ✅ If Cartesia fails → OpenAI TTS takes over in milliseconds
- ✅ Call continues instead of crashing

---

## 📋 Checklist Before Running

- [ ] Updated requirements.txt dependencies: `pip install -r requirements.txt`
- [ ] Created .env file with all API keys filled in
- [ ] Ran `python cartesia_diagnostics.py` - it shows voices
- [ ] Ran `python test_tts.py` - both show ✅
- [ ] Ready to run: `python main.py dev`

---

## 🔧 If It Still Fails

### Cartesia Diagnostics Shows Error
1. **"Invalid API key"** → Check CARTESIA_API_KEY in .env
2. **"Rate limited"** → You hit quota limit, upgrade Cartesia plan
3. **"No voices available"** → Account issue, contact Cartesia support

### Cartesia Works But Agent Still Crashes
1. Check if OpenAI fallback is enabled (look for `fallback_tts=openai.TTS`)
2. Make sure OPENAI_API_KEY is set in .env
3. Run `test_tts.py` again to verify OpenAI is working

### Want to Use Only OpenAI (Most Stable)
Edit `agent/main.py` around line 138:
```python
tts=openai.TTS(
    voice="fable",
    speed=1.0,
),
```
Remove the Cartesia section entirely. More expensive but very stable.

---

## 📚 Files I Created for You

| File | Purpose |
|------|---------|
| `cartesia_diagnostics.py` | Check Cartesia API health & available voices |
| `test_tts.py` | Test both TTS providers before running agent |
| `TTS_TROUBLESHOOTING.md` | Complete troubleshooting guide |
| `.env.example` | Updated with OPENAI_API_KEY |
| `requirements.txt` | Updated with openai plugin & aiohttp |

---

## 💡 Common Questions

**Q: Why is the agent still unstable?**
A: Probably missing OPENAI_API_KEY. Without it, there's no fallback if Cartesia fails.

**Q: Will OpenAI fallback cost extra?**
A: Yes, but only if Cartesia fails. Normal calls use Cartesia.

**Q: How do I know if it's using fallback?**
A: Check logs for:
- `"WARNING: using fallback TTS"` → Cartesia failed, OpenAI took over
- No warning → Cartesia is working fine

**Q: The voice sounds different sometimes. Why?**
A: If Cartesia fails, it switches to OpenAI voice. That's why we set it up — to keep the call going.

---

## 🆘 Need More Help?

1. **Cartesia voice ID:** Run `python cartesia_diagnostics.py` and use a different voice ID
2. **Detailed troubleshooting:** See `TTS_TROUBLESHOOTING.md`
3. **Test individual components:** Run `test_tts.py`

---

**Ready? Run this:**
```bash
cd agent
python main.py dev
```

If you see: `✅ Voice pipeline created` — You're good to go!
