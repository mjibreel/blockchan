# 🚀 Deploy to Netlify (Frontend) + Fly.io (Backend)

Free hosting setup: Netlify for frontend, Fly.io for backend!

---

## Part 1: Deploy Backend on Fly.io

### Step 1: Install Fly.io CLI

**On Windows (PowerShell as Admin):**
```powershell
# Install using winget
winget install -e --id Flyio.Flyctl

# Or using PowerShell (as Administrator)
iwr https://fly.io/install.ps1 -useb | iex
```

**Verify installation:**
```powershell
flyctl version
```

### Step 2: Sign Up / Login to Fly.io

```powershell
flyctl auth signup
# Or if you have an account:
flyctl auth login
```

### Step 3: Create Fly.io App for Backend

```powershell
cd C:\Users\jibre\OneDrive\Desktop\block\backend
flyctl launch
```

When prompted:
- **App name**: `qubic-backend` (or any unique name)
- **Region**: Choose closest to you (e.g., `iad` for US East)
- **PostgreSQL**: **No** (you're using Supabase)
- **Redis**: **No**

### Step 4: Configure Fly.io

Create `backend/fly.toml` (if not auto-created):

```toml
app = "qubic-backend"
primary_region = "iad"

[build]

[env]
  PORT = "3001"
  NODE_ENV = "production"

[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[http_service.checks]]
  interval = "10s"
  timeout = "2s"
  grace_period = "5s"
  method = "GET"
  path = "/health"
```

### Step 5: Set Environment Variables

```powershell
flyctl secrets set SUPABASE_URL=https://iefjcektsnoyrontolno.supabase.co
flyctl secrets set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZmpjZWt0c25veXJvbnRvbG5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAxOTcxNCwiZXhwIjoyMDgwNTk1NzE0fQ.6LY-kk0qv7R78ch0bRHqTU0DboHJblaIz4mLGnWz5bc
flyctl secrets set PRIVATE_KEY=be1c2331d6579d0b1f82cca904f159b68fb07357f120a8b7a1aace85dd275549
flyctl secrets set RPC_URL=https://rpc-amoy.polygon.technology
flyctl secrets set CHAIN_ID=80002
flyctl secrets set CONTRACT_ADDRESS=0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA
flyctl secrets set PORT=3001
flyctl secrets set NODE_ENV=production
```

### Step 6: Deploy Backend

```powershell
flyctl deploy
```

### Step 7: Get Backend URL

```powershell
flyctl status
# Or
flyctl info
```

Your backend URL will be: `https://qubic-backend.fly.dev`

**Test it:**
```powershell
# Visit in browser:
# https://qubic-backend.fly.dev/health
```

---

## Part 2: Deploy Frontend on Netlify

### Step 1: Sign Up for Netlify

1. Go to **https://app.netlify.com**
2. Click **"Sign up"** → Sign in with **GitHub**
3. Authorize Netlify to access your GitHub

### Step 2: Deploy from GitHub

1. In Netlify dashboard, click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Select repository: **mjibreel/blockchan**
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `frontend/build`

### Step 3: Add Environment Variables

Before deploying, click **"Show advanced"** → **"New variable"**:

```
REACT_APP_API_URL=https://qubic-backend.fly.dev
REACT_APP_CHAIN_ID=80002
REACT_APP_POLYGONSCAN_URL=https://amoy.polygonscan.com
REACT_APP_CONTRACT_ADDRESS=0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA
```

⚠️ **Important**: Replace `https://qubic-backend.fly.dev` with your actual Fly.io backend URL from Part 1!

### Step 4: Deploy

Click **"Deploy site"**

### Step 5: Get Your Frontend URL

Netlify will assign you a URL like: `https://qubic-frontend.netlify.app`

You can also set a custom domain later.

---

## ✅ Verification

1. **Test Backend:**
   - Visit: `https://qubic-backend.fly.dev/health`
   - Should return: `{"status":"ok","message":"Qubic File Stamp API is running"}`

2. **Test Frontend:**
   - Visit your Netlify URL
   - Try connecting wallet and stamping a file!

---

## 🔧 Troubleshooting

### Backend Issues:

**Port binding error:**
- Make sure your `server.js` uses `process.env.PORT || 3001`
- Fly.io sets PORT automatically

**CORS errors:**
- Make sure CORS is enabled in backend (already in your code ✅)
- Add Netlify URL to CORS allowed origins if needed

**Environment variables not working:**
- Use `flyctl secrets list` to verify
- Use `flyctl secrets set` to update

### Frontend Issues:

**Can't connect to backend:**
- Verify `REACT_APP_API_URL` matches your Fly.io backend URL
- Check backend is running: `flyctl status`
- Restart frontend deployment after changing env vars

**Build fails:**
- Check Netlify build logs
- Make sure `frontend/package.json` has all dependencies
- Verify build command is correct

---

## 📊 Resource Limits (Free Tier)

### Fly.io Free Tier:
- ✅ 3 shared-cpu-1x VMs
- ✅ 3GB persistent volume storage
- ✅ 160GB outbound data transfer
- ✅ Enough for small to medium apps

### Netlify Free Tier:
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Unlimited sites
- ✅ More than enough for most apps!

---

## 🎉 Done!

Your app is now live:
- **Backend**: `https://qubic-backend.fly.dev`
- **Frontend**: `https://your-app.netlify.app`

---

## 🔄 Updating Your App

**Backend:**
```powershell
cd backend
# Make changes
flyctl deploy
```

**Frontend:**
- Push changes to GitHub
- Netlify auto-deploys!

---

## 💡 Pro Tips

1. **Fly.io:** Use `flyctl logs` to see backend logs in real-time
2. **Netlify:** Enable "Auto-publish" for automatic deployments
3. **Both:** Set up notifications for deployment status

---

**Ready to deploy?** Start with Part 1 (Fly.io backend)!

