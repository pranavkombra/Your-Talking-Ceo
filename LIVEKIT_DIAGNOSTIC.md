# LiveKit Connection Diagnostic Guide

## Error: "could not establish signal connection: Failed to fetch"

This error means the browser cannot reach the LiveKit server. Here's how to diagnose and fix it.

---

## Quick Checklist

### 1. ✅ Frontend Environment Variables
```bash
cd frontend
cat .env.local
```

Should contain:
```env
LIVEKIT_URL=wss://maneuver-voice-3vqgrhi4.livekit.cloud
LIVEKIT_API_KEY=APIGRugyp6vM4Sz
LIVEKIT_API_SECRET=MpqIK00I9cnAWKeqWRSBLWWb6HfXaJ4osAff5zR6oIIA
```

### 2. ✅ Token Endpoint Test

Open browser console and run:
```javascript
// Test if /api/token endpoint works
fetch('/api/token', { 
  method: 'POST', 
  body: JSON.stringify({})
})
.then(r => r.json())
.then(d => console.log('✅ Token:', d))
.catch(e => console.error('❌ Error:', e))
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

**If you see 500 error:**
- Server restart needed: `npm run dev` (in frontend dir)
- Check server console for error message

### 3. ✅ LiveKit Server Reachability

```javascript
// Test if LiveKit URL is reachable
const url = 'wss://maneuver-voice-3vqgrhi4.livekit.cloud';
console.log('Testing', url);

const ws = new WebSocket(url);
ws.onopen = () => console.log('✅ LiveKit server is reachable');
ws.onerror = (e) => console.error('❌ Cannot reach LiveKit:', e);
ws.onclose = () => ws.close();

// Close after 5 seconds
setTimeout(() => ws.close(), 5000);
```

**If error:**
- Firewall blocking WebSocket connections
- LiveKit URL is invalid
- Network is down

### 4. ✅ Python Agent Running

```bash
cd agent
# Check if agent is running
ps aux | grep "python main.py"

# If not running, start it:
python main.py dev
```

The agent needs to be running to:
- Accept room connections
- Handle voice I/O
- Respond to queries

---

## Root Causes & Solutions

| Symptom | Cause | Solution |
|---------|-------|----------|
| **Token endpoint returns 500** | `.env.local` not loaded | Restart frontend: `npm run dev` |
| **Token endpoint returns error** | Missing credentials | Add `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` to `.env.local` |
| **Token fetch fails (network)** | Endpoint not responding | Check frontend dev server is running |
| **LiveKit connection fails** | Invalid token | Verify token generation (check /api/token response) |
| **WebSocket connection blocked** | Firewall/Network | Check browser Network tab for WebSocket errors |
| **Agent doesn't respond** | Agent not running | Start agent: `python main.py dev` |

---

## Full Diagnostic Script

Run this in browser console:
```javascript
async function diagnoseConnection() {
  console.log('=== LiveKit Connection Diagnostic ===\n');
  
  // 1. Check token endpoint
  console.log('1️⃣ Testing /api/token endpoint...');
  try {
    const tokenRes = await fetch('/api/token', {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    if (!tokenRes.ok) {
      console.error('❌ Token endpoint error:', tokenRes.status, await tokenRes.text());
      return;
    }
    
    const token = await tokenRes.json();
    console.log('✅ Token received:', token);
    
    // 2. Validate token format
    console.log('\n2️⃣ Validating token...');
    if (!token.participantToken || token.participantToken.length < 100) {
      console.error('❌ Invalid token format');
      return;
    }
    console.log('✅ Token format valid');
    
    // 3. Check LiveKit URL
    console.log('\n3️⃣ Checking LiveKit URL...');
    if (!token.serverUrl) {
      console.error('❌ No serverUrl in token response');
      return;
    }
    console.log('✅ LiveKit URL:', token.serverUrl);
    
    // 4. Test WebSocket connection
    console.log('\n4️⃣ Testing WebSocket connection to LiveKit...');
    try {
      const ws = new WebSocket(token.serverUrl);
      
      await new Promise((resolve, reject) => {
        ws.onopen = () => {
          console.log('✅ WebSocket connection successful');
          ws.close();
          resolve(true);
        };
        ws.onerror = (e) => {
          console.error('❌ WebSocket error:', e);
          reject(e);
        };
        setTimeout(() => {
          console.error('❌ WebSocket timeout');
          reject(new Error('Timeout'));
        }, 5000);
      });
    } catch (e) {
      console.error('❌ WebSocket failed:', e);
      console.log('\nPossible causes:');
      console.log('- Firewall blocking WebSocket connections');
      console.log('- Invalid LiveKit URL');
      console.log('- Network connectivity issue');
      return;
    }
    
    console.log('\n✅ All diagnostic checks passed!');
    console.log('The issue is likely in the agent or room configuration.');
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
  }
}

diagnoseConnection();
```

---

## If Everything Passes But Still Fails

The issue is likely:

1. **Agent not dispatched** - Python agent isn't receiving the connection
   - Verify `AGENT_NAME=maneuver-alex` in both `.env` files
   - Check agent logs: `python main.py dev`

2. **Room configuration issue** - Agent rejecting room
   - Check agent code for any room validation
   - Look for room size limits or other constraints

3. **LiveKit Project limits** - Account limits exceeded
   - Check LiveKit dashboard for active connections
   - Verify subscription tier

4. **Network latency** - Timeout during connection
   - Try increasing timeout values in livekit-client config
   - Check internet connection speed

---

## Contact Support

If diagnostics pass but connection fails:
1. Collect browser console output
2. Collect agent logs from `python main.py dev`
3. Check LiveKit dashboard at https://cloud.livekit.io
4. Share project name and error details
