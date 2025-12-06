# 🚀 Deploy Backend on Vercel (FREE - No Credit Card!)

Vercel can host your Express backend! This is a great free option.

## Step 1: Install Vercel CLI

```powershell
npm install -g vercel
```

Or if you prefer npx (no install needed):
```powershell
# We'll use npx, so no installation needed
```

## Step 2: Create vercel.json in Backend Folder

We need to create a `vercel.json` file to tell Vercel how to handle your Express app.

Create file: `backend/vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Step 3: Update server.js for Vercel

Vercel expects the app to be exported. Let's check if server.js needs modification.

Your current `server.js` should work, but we need to export it properly for Vercel.

## Step 4: Deploy via Vercel Dashboard (Easier)

### Option A: Via Dashboard (Recommended)

1. Go to **https://vercel.com**
2. Sign up/Login with **GitHub**
3. Click **"Add New..."** → **"Project"**
4. Import repository: **mjibreel/blockchan**
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `backend` ⚠️ **Change this!**
   - **Build Command**: Leave empty (or `npm install`)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`
6. Go to **"Environment Variables"** and add:
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
7. Click **"Deploy"**

### Option B: Via CLI

```powershell
cd backend
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name: **qubic-backend** (or any name)
- Directory: **./** (current directory)
- Override settings? **No**

Then set environment variables:
```powershell
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
vercel env add PRIVATE_KEY
vercel env add RPC_URL
vercel env add CHAIN_ID
vercel env add CONTRACT_ADDRESS
vercel env add NODE_ENV
vercel env add PORT
```

Then deploy:
```powershell
vercel --prod
```

## Step 5: Get Your Backend URL

After deployment, Vercel will give you a URL like:
`https://qubic-backend.vercel.app` or `https://qubic-backend-xxxxx.vercel.app`

## Step 6: Update Netlify Frontend

1. Go to https://app.netlify.com
2. Select your site: **mjibreel-blockchan**
3. Go to **"Site settings"** → **"Environment variables"**
4. Update `REACT_APP_API_URL`:
   ```
   REACT_APP_API_URL=https://your-backend.vercel.app
   ```
5. Go to **"Deploys"** tab
6. Click **"Trigger deploy"** → **"Clear cache and deploy site"**

## ✅ Done!

Your app is now live:
- **Frontend**: https://mjibreel-blockchan.netlify.app
- **Backend**: Your Vercel URL

---

## 🔧 Important Notes

### Vercel Serverless Functions

Vercel converts your Express app to serverless functions. This should work with your current code, but note:

- Each API route becomes a serverless function
- Cold starts may add slight delay (first request)
- Vercel handles routing automatically

### If You Get Errors

**"Module not found" errors:**
- Make sure all dependencies are in `package.json`
- Vercel installs from `package.json` automatically

**"Port binding" errors:**
- Vercel doesn't use PORT env var like traditional hosting
- Your `process.env.PORT || 3001` should still work
- Vercel handles port internally

---

## 💡 Pro Tips

1. **Free Tier Limits:**
   - 100GB bandwidth/month
   - 100 serverless function executions/second
   - More than enough for most apps!

2. **Auto-deploy:**
   - Vercel auto-deploys on git push
   - Just push to GitHub and it updates!

3. **Custom Domain:**
   - Add custom domain in Vercel settings
   - Free SSL included

---

**Ready to try? Start with Step 1!**

