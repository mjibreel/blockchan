# 🚀 Quick Deploy to Render via Terminal

## Option 1: Use Render API Script (Automated)

### Step 1: Get Render API Token

1. Go to https://dashboard.render.com/account/api-keys
2. Sign in to your Render account
3. Click **"New API Key"**
4. Copy the token (you'll need it)

### Step 2: Run Deployment Script

```powershell
# Basic deployment (uses default private key)
.\deploy-to-render.ps1 -ApiToken "YOUR_RENDER_API_TOKEN"

# Full deployment with Supabase credentials
.\deploy-to-render.ps1 -ApiToken "YOUR_RENDER_API_TOKEN" -SupabaseUrl "YOUR_SUPABASE_URL" -SupabaseKey "YOUR_SUPABASE_KEY"
```

---

## Option 2: Manual Deploy via Web (Recommended for First Time)

Since you mentioned you've used Render before, here's the quick manual way:

### Backend Deployment:

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo: **mjibreel/blockchan**
4. Settings:
   - Name: `qubic-backend`
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=your_url
   SUPABASE_SERVICE_KEY=your_key
   PRIVATE_KEY=be1c2331d6579d0b1f82cca904f159b68fb07357f120a8b7a1aace85dd275549
   RPC_URL=https://rpc-amoy.polygon.technology
   CHAIN_ID=80002
   CONTRACT_ADDRESS=0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA
   ```
6. Deploy!

### Frontend Deployment:

1. **"New +"** → **"Static Site"**
2. Same repo: **mjibreel/blockchan**
3. Settings:
   - Name: `qubic-frontend`
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `build`
4. Environment Variables:
   ```
   REACT_APP_API_URL=https://qubic-backend.onrender.com
   REACT_APP_CHAIN_ID=80002
   REACT_APP_POLYGONSCAN_URL=https://amoy.polygonscan.com
   REACT_APP_CONTRACT_ADDRESS=0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA
   ```
5. Deploy!

---

## Option 3: Use Render Blueprint (Easiest if you have API token)

Your `render.yaml` is already configured! Just need to:

1. Get API token from https://dashboard.render.com/account/api-keys
2. Push to GitHub (already done ✅)
3. Create services via API or web dashboard

---

**Which method do you prefer?** The script automates everything, but manual gives you more control!

