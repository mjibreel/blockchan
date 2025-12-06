# 🚀 Quick Render Deployment Steps

Your code is now on GitHub: https://github.com/mjibreel/blockchan.git

## Step 1: Deploy Backend

1. Go to https://render.com
2. Sign in (or sign up with GitHub)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository: **mjibreel/blockchan**
5. Configure:
   - **Name**: `qubic-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ Important!
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Click **"Advanced"** and add these Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_SERVICE_KEY=your_supabase_service_key_here
   PRIVATE_KEY=be1c2331d6579d0b1f82cca904f159b68fb07357f120a8b7a1aace85dd275549
   RPC_URL=https://rpc-amoy.polygon.technology
   CHAIN_ID=80002
   CONTRACT_ADDRESS=0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA
   ```
7. Click **"Create Web Service"**
8. Wait for deployment (~5-10 minutes)
9. **Copy your backend URL** (e.g., `https://qubic-backend.onrender.com`)

## Step 2: Deploy Frontend

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect the same repository: **mjibreel/blockchan**
3. Configure:
   - **Name**: `qubic-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend` ⚠️ Important!
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://qubic-backend.onrender.com
   REACT_APP_CHAIN_ID=80002
   REACT_APP_POLYGONSCAN_URL=https://amoy.polygonscan.com
   REACT_APP_CONTRACT_ADDRESS=0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA
   ```
   ⚠️ **IMPORTANT**: Replace `https://qubic-backend.onrender.com` with your actual backend URL from Step 1!
5. Click **"Create Static Site"**
6. Wait for deployment (~5 minutes)
7. **Your app is live!** 🎉

## Step 3: Update Frontend Environment Variable (If Needed)

After backend is deployed:
1. Go to your frontend service in Render
2. Go to **"Environment"** tab
3. Update `REACT_APP_API_URL` with your actual backend URL
4. Click **"Save Changes"** → Auto-redeploys

## ✅ Verification

1. Visit your frontend URL (e.g., `https://qubic-frontend.onrender.com`)
2. Click **"Connect Wallet"**
3. Try uploading and stamping a file!

## 🔧 Troubleshooting

### Backend not starting?
- Check logs in Render dashboard
- Verify all environment variables are set
- Make sure `PORT=10000` is set

### Frontend can't connect to backend?
- Check `REACT_APP_API_URL` points to correct backend URL
- Make sure backend is running (visit backend URL + `/health`)
- Check CORS settings (should already be enabled in your code)

### Free tier limitations?
- Render free tier may sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Consider upgrading if you need always-on service

## 🎉 Done!

Your blockchain app is now live on the internet!

Share your URL: `https://qubic-frontend.onrender.com` (or your custom domain)

