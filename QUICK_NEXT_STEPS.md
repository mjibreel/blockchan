# 🚀 Next Steps: Deploy Backend on Fly.io

Your frontend is live! 🎉
**Frontend URL:** https://mjibreel-blockchan.netlify.app

Now deploy the backend so your app works end-to-end!

---

## Step 1: Install Fly.io CLI

Open PowerShell (as Administrator) and run:

```powershell
winget install -e --id Flyio.Flyctl
```

Or if that doesn't work:
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Verify installation:**
```powershell
flyctl version
```

---

## Step 2: Sign Up / Login to Fly.io

```powershell
flyctl auth signup
```

This will:
- Open your browser
- Create a free Fly.io account (no credit card needed!)
- Authorize the CLI

**Or if you already have an account:**
```powershell
flyctl auth login
```

---

## Step 3: Navigate to Backend Folder

```powershell
cd C:\Users\jibre\OneDrive\Desktop\block\backend
```

---

## Step 4: Launch Fly.io App

```powershell
flyctl launch
```

When prompted:
- **App name**: `qubic-backend` (or any unique name, like `mjibreel-qubic-backend`)
- **Region**: Choose closest to you (e.g., `iad` for US East, `lhr` for London)
- **PostgreSQL**: **No** (you're using Supabase)
- **Redis**: **No**
- **Deploy now**: **No** (we'll set env vars first)

This creates the `fly.toml` file (we already have one, so it will ask to overwrite - say **No**)

---

## Step 5: Set Environment Variables

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

---

## Step 6: Deploy Backend

```powershell
flyctl deploy
```

This will:
- Build your backend
- Deploy to Fly.io
- Give you a URL like: `https://qubic-backend.fly.dev`

**Wait for deployment to complete** (~2-5 minutes)

---

## Step 7: Test Backend

Visit your backend health endpoint:
```
https://qubic-backend.fly.dev/health
```

Should return:
```json
{"status":"ok","message":"Qubic File Stamp API is running"}
```

---

## Step 8: Update Frontend Environment Variables

1. Go to https://app.netlify.com
2. Select your site: **mjibreel-blockchan**
3. Go to **"Site settings"** → **"Environment variables"**
4. Update `REACT_APP_API_URL` to your Fly.io backend URL:
   ```
   REACT_APP_API_URL=https://qubic-backend.fly.dev
   ```
   (Replace with your actual backend URL)

5. Click **"Save"**
6. Go to **"Deploys"** tab
7. Click **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## ✅ Done!

Your app should now be fully functional:
- **Frontend:** https://mjibreel-blockchan.netlify.app
- **Backend:** https://qubic-backend.fly.dev

Try it out:
1. Visit your frontend URL
2. Connect your MetaMask wallet
3. Try stamping a file!

---

## 🔧 Troubleshooting

**Backend not deploying?**
- Make sure you're in the `backend` folder
- Check `fly.toml` exists
- Verify all secrets are set: `flyctl secrets list`

**Frontend can't connect?**
- Verify backend URL is correct in Netlify env vars
- Check backend is running: visit `/health` endpoint
- Make sure you triggered a new deploy after updating env vars

**Need help?**
- Fly.io docs: https://fly.io/docs
- Fly.io status: `flyctl status`
- Fly.io logs: `flyctl logs`

---

**Ready? Start with Step 1!** 🚀

