# 🚂 Deploy Backend on Railway (Easiest Alternative)

Railway is super easy and gives $5 free credit monthly (usually enough for small apps).

## Step 1: Sign Up

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (easiest)
4. ⚠️ **Note**: Railway may ask for a credit card, but they won't charge you if you stay under $5/month (which is very likely for a small app)

## Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: **mjibreel/blockchan**
4. Railway will detect it's a Node.js project

## Step 3: Configure Backend

1. Railway will show your repo files
2. Click on the service that was created
3. Go to **"Settings"** tab
4. Set **"Root Directory"** to: `backend`
5. Set **"Start Command"** to: `npm start`

## Step 4: Add Environment Variables

1. Go to **"Variables"** tab
2. Click **"New Variable"** and add each one:

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://iefjcektsnoyrontolno.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZmpjZWt0c25veXJvbnRvbG5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAxOTcxNCwiZXhwIjoyMDgwNTk1NzE0fQ.6LY-kk0qv7R78ch0bRHqTU0DboHJblaIz4mLGnWz5bc
PRIVATE_KEY=be1c2331d6579d0b1f82cca904f159b68fb07357f120a8b7a1aace85dd275549
RPC_URL=https://rpc-amoy.polygon.technology
CHAIN_ID=80002
CONTRACT_ADDRESS=0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA
```

## Step 5: Get Your Backend URL

1. Go to **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"** (if not already generated)
4. Copy your backend URL (e.g., `https://qubic-backend-production.up.railway.app`)

## Step 6: Update Netlify Frontend

1. Go to https://app.netlify.com
2. Select your site: **mjibreel-blockchan**
3. Go to **"Site settings"** → **"Environment variables"**
4. Update `REACT_APP_API_URL` with your Railway backend URL:
   ```
   REACT_APP_API_URL=https://your-railway-url.up.railway.app
   ```
5. Go to **"Deploys"** tab
6. Click **"Trigger deploy"** → **"Clear cache and deploy site"**

## ✅ Done!

Your app should now work:
- **Frontend**: https://mjibreel-blockchan.netlify.app
- **Backend**: Your Railway URL

---

## 💰 Cost

- Railway gives **$5 free credit monthly**
- Small Node.js apps typically use **$0-2/month**
- You'll likely never be charged!
- Can set spending limits in settings

---

## 🔧 Troubleshooting

**Backend not starting?**
- Check Railway logs: Click on your service → "Deployments" → View logs
- Verify all environment variables are set
- Make sure Root Directory is `backend`

**Frontend can't connect?**
- Verify backend URL in Netlify env vars
- Check backend is running (visit Railway URL + `/health`)
- Make sure you triggered a new Netlify deploy after updating env vars

