# 🌐 ngrok Setup for Mobile Testing

## Current Status: ✅ Local Network Working
Your backend is running on `http://192.168.1.20:8000` and should work if your phone is on the same WiFi network.

**Try the local network first!** If your React Native app can connect to the backend, you don't need ngrok.

---

## When You Need ngrok

Use ngrok if:
- Your phone can't connect to `http://192.168.1.20:8000`
- You're using mobile data instead of WiFi
- Your network blocks local connections
- You want to test from different locations

---

## ngrok Setup (Free Account Required)

### Step 1: Sign Up for ngrok (Free)
1. Go to: https://dashboard.ngrok.com/signup
2. Create a free account (no credit card needed)
3. Verify your email

### Step 2: Get Your Auth Token
1. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your auth token (starts with `2...`)

### Step 3: Configure ngrok
```powershell
# Set up ngrok path (run this each time you open PowerShell)
$ngrokPath = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"

# Add your auth token (replace YOUR_TOKEN with actual token)
& $ngrokPath config add-authtoken YOUR_TOKEN
```

### Step 4: Start ngrok Tunnel
```powershell
# Start the tunnel (keep this running)
& $ngrokPath http 8000
```

You'll see output like:
```
ngrok                                                                                                                                                                   
                                                                                                                                                                        
Visit http://localhost:4040 for ngrok web interface                                                                                                                    

Session Status                online                                                                                                                                    
Account                       your.email@example.com (Plan: Free)                                                                                                      
Version                       3.3.1                                                                                                                                     
Region                        United States (us)                                                                                                                        
Latency                       25ms                                                                                                                                      
Web Interface                 http://127.0.0.1:4040                                                                                                                    
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:8000                                                                              

Connections                   ttl     opn     rt1     rt5     p50     p90                                                                                               
                              0       0       0.00    0.00    0.00    0.00  
```

### Step 5: Update .env File
Copy the `https://abc123.ngrok-free.app` URL and update your `.env`:

```env
EXPO_PUBLIC_SERVER_URL=https://abc123.ngrok-free.app
```

### Step 6: Restart Expo
```bash
npm start
```

---

## Alternative: Create ngrok Alias (One-time setup)

Add this to your PowerShell profile to make `ngrok` command available:

```powershell
# Add to: $PROFILE (create if doesn't exist)
$ngrokPath = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
Set-Alias ngrok $ngrokPath
```

Then you can just use:
```powershell
ngrok http 8000
```

---

## Testing Your Setup

Once ngrok is running:

1. **Test the tunnel:**
   ```bash
   curl https://your-ngrok-url.ngrok-free.app/health
   ```

2. **Check ngrok web interface:**
   Open http://localhost:4040 in your browser to see requests

3. **Test with your React Native app:**
   The app should now be able to connect from anywhere!

---

## Free Plan Limitations

- 1 online tunnel at a time
- Random subdomain (changes each restart)
- ngrok branding page on first visit
- No custom domains

**This is perfect for development and testing!**

---

## 💡 Pro Tips

1. **Keep ngrok running:** Don't close the terminal window with ngrok
2. **Use HTTPS URL:** Always use the `https://` URL, not `http://`
3. **Bookmark the tunnel:** The URL changes each time you restart ngrok
4. **Check logs:** Use http://localhost:4040 to debug connection issues

Your anemia detection app will work great with either local network or ngrok! 🚀
