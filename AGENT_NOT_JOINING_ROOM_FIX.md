# Agent Not Joining Room - Fix Guide

## Problem

Agent starts successfully but never receives audio from browser participant:
```
input stream attached {"participant": null, "source": "SOURCE_UNKNOWN"}
```

This means the **browser client is not actually joining the room**.

---

## Root Causes

1. **Microphone permission denied** - Browser blocked access to microphone
2. **Room connection fails silently** - Network or token issue
3. **Audio not being published** - Client joins but doesn't enable audio tracks
4. **Session context not initialized** - useSession() fails

---

## Fix Steps

### Step 1: Restart Frontend Dev Server

Environment variables must be reloaded:

```bash
cd frontend
# Clear build cache
rm -r .next

# Restart dev server
pnpm dev
```

**Wait for the server to start** - It will show something like:
```
ready - started server on 0.0.0.0:3000
```

### Step 2: Grant Microphone Permission

When you click **"Talk to Alex"** button, your browser will ask for microphone access:

- ✅ **Allow** - Microphone access permitted
- ❌ **Deny** - Agent won't receive audio

**If you denied by accident:**
1. Click the camera/microphone icon in the URL bar
2. Change Microphone to **"Allow"**
3. Refresh the page

### Step 3: Check Browser Console

Open **DevTools** (F12) and go to **Console** tab:

Look for these messages:
```
[App] Session state: {"isConnected": false, "isConnecting": true}
[App] Session state: {"isConnected": true, "isConnecting": false}
✅ Connected to room: voice_assistant_room_...
🎤 Audio track published: 1 track(s)
```

**If you see errors instead:**
- Copy the error message
- Check the [Diagnostic Steps](#diagnostic-steps) below

### Step 4: Test the Connection

1. Click **"Talk to Alex"** button
2. You should see:
   - Loading indicator appears
   - Agent says opening line
   - You can speak and the agent responds

**If agent doesn't respond:**
- Check browser console for errors
- Verify agent is still running: `python main.py dev`
- Restart both frontend and agent

---

## Diagnostic Steps

### 1. Check Token Endpoint

In browser console (F12):
```javascript
fetch('/api/token', { 
  method: 'POST', 
  body: JSON.stringify({})
})
.then(r => r.json())
.then(d => {
  console.log('✅ Token response:', d);
  console.log('serverUrl:', d.serverUrl);
  console.log('roomName:', d.roomName);
})
.catch(e => console.error('❌ Token error:', e));
```

**Expected response:**
```json
{
  "serverUrl": "wss://maneuver-voice-3vqgrhi4.livekit.cloud",
  "roomName": "voice_assistant_room_1234",
  "participantToken": "eyJ...",
  "participantName": "user"
}
```

**If 500 error:** Restart frontend dev server

### 2. Check Microphone Permission

```javascript
// Request microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Microphone access granted');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(e => console.error('❌ Microphone blocked:', e));
```

**If error:** Allow microphone in browser permissions

### 3. Check Room Connection State

```javascript
// In console after clicking "Talk to Alex"
// Open the Components tab in DevTools and inspect the session state
// Look for: isConnected: true
```

### 4. Full Diagnostic Script

Paste in console:
```javascript
console.clear();
console.log('=== LiveKit Connection Diagnostic ===\n');

async function diagnose() {
  // 1. Check token
  console.log('1️⃣ Checking token endpoint...');
  const tokenRes = await fetch('/api/token', {
    method: 'POST',
    body: JSON.stringify({})
  });
  
  if (!tokenRes.ok) {
    console.error('❌ Token endpoint failed:', tokenRes.status);
    return;
  }
  
  const token = await tokenRes.json();
  console.log('✅ Token valid');
  
  // 2. Check microphone
  console.log('\n2️⃣ Checking microphone...');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('✅ Microphone accessible');
    stream.getTracks().forEach(t => t.stop());
  } catch (e) {
    console.error('❌ Microphone blocked:', e.message);
    return;
  }
  
  // 3. Check WebSocket
  console.log('\n3️⃣ Checking LiveKit WebSocket...');
  const ws = new WebSocket(token.serverUrl);
  
  await new Promise((resolve) => {
    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      ws.close();
      resolve(true);
    };
    ws.onerror = (e) => {
      console.error('❌ WebSocket failed:', e);
      resolve(false);
    };
    setTimeout(() => {
      console.error('❌ WebSocket timeout');
      resolve(false);
    }, 5000);
  });
  
  console.log('\n✅ All diagnostics passed!');
  console.log('If still not working, check agent logs: python main.py dev');
}

diagnose();
```

---

## If Diagnostic Passes But Still Fails

### Issue: Token endpoint returns 500

**Fix:**
```bash
# Restart frontend dev server
cd frontend
npm run dev
```

### Issue: Microphone blocked

**Fix:**
1. Open browser settings
2. Find "maneuver.app" or localhost
3. Change Microphone to "Allow"
4. Refresh page

### Issue: Agent never receives connection

**Check:**
1. Python agent is running: `python main.py dev`
2. Agent is listening on correct port
3. Check agent logs for errors

**Example agent startup should show:**
```
02:06:38.064 INFO livekit.agents registered worker {"agent_name": "maneuver-alex", ...}
```

### Issue: Connection drops immediately

**Check:**
1. Browser DevTools Network tab for errors
2. Agent logs for timeout warnings
3. Internet connection stability

---

## What These Fixes Do

| Fix | Purpose |
|-----|---------|
| Restart dev server | Reload environment variables (LIVEKIT_URL, etc.) |
| Allow microphone | Enables browser → agent audio stream |
| useRoomConnectionDebug hook | Logs what's happening during connection |
| Audio configuration in useSession | Ensures audio tracks are enabled |
| Error logging in useAgentErrors | Catches connection failures |

---

## Common Error Messages

### "participant": null
- **Cause:** Browser never joined room with audio
- **Fix:** Check microphone permission, restart server

### "Failed to fetch" / "serverUnreachable"
- **Cause:** Token endpoint or LiveKit server unreachable
- **Fix:** Run diagnostic script, check network

### "entrypoint did not exit in time, cancelling"
- **Cause:** Agent timeout waiting for user input
- **Fix:** Speak into microphone within first few seconds

### "no stream available"
- **Cause:** Agent can't receive audio from browser
- **Fix:** Check microphone enabled, audio track publishing

---

## Quick Checklist

Before clicking "Talk to Alex":

- [ ] Frontend dev server is running (`npm run dev` shows "ready")
- [ ] Python agent is running (`python main.py dev` shows "registered worker")
- [ ] Browser microphone is allowed in permissions
- [ ] You're at `http://localhost:3000`
- [ ] `.env.local` file exists in `frontend/` directory
- [ ] No red error messages in browser console

If all checked, click the button and the agent should respond!

---

## Still Having Issues?

1. **Check browser console** (F12) - Copy any error messages
2. **Check agent logs** - Look for error messages in terminal
3. **Run diagnostic script** (above) - Identifies which component is failing
4. **Restart everything:**
   ```bash
   # Terminal 1: Agent
   cd agent
   python main.py dev
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```
5. **Try with fresh browser tab** - Sometimes state gets stuck
