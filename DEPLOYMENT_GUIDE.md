# 🚀 Deployment Guide - Qubic File Stamp

Free hosting options for your blockchain web application.

## 📋 What Needs to Be Deployed

1. **Frontend** (React app) - User interface
2. **Backend** (Express API) - Server that talks to blockchain and database
3. **Smart Contract** - ✅ Already deployed on Polygon Amoy (no action needed)

---

## 🎯 Recommended: Render (Easiest for Beginners)

**Why Render?**
- ✅ Free tier available
- ✅ Easy setup (connects to GitHub)
- ✅ Supports both frontend AND backend
- ✅ Built-in environment variables
- ✅ Auto-deploys on git push

### Step 1: Push Code to GitHub

1. Create a GitHub account if you don't have one: https://github.com
2. Create a new repository
3. Push your code:

```bash
cd C:\Users\jibre\OneDrive\Desktop\block
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Deploy Backend on Render

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `qubic-backend` (or any name)
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (we'll set it later)
6. Click "Advanced" and set:
   - **Root Directory**: `backend`
7. Add Environment Variables:
   ```
   PORT=10000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   PRIVATE_KEY=your_private_key
   RPC_URL=https://rpc-amoy.polygon.technology
   CHAIN_ID=80002
   CONTRACT_ADDRESS=0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA
   NODE_ENV=production
   ```
8. Click "Create Web Service"
9. Wait for deployment (~5 minutes)
10. Copy your backend URL (e.g., `https://qubic-backend.onrender.com`)

### Step 3: Deploy Frontend on Render

1. In Render dashboard, click "New +" → "Static Site"
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `qubic-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://qubic-backend.onrender.com
   REACT_APP_CHAIN_ID=80002
   REACT_APP_POLYGONSCAN_URL=https://amoy.polygonscan.com
   REACT_APP_CONTRACT_ADDRESS=0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA
   ```
5. Click "Create Static Site"
6. Your app will be live at: `https://qubic-frontend.onrender.com`

---

## 🚄 Alternative: Railway (Also Great!)

**Why Railway?**
- ✅ Free $5 credit monthly
- ✅ Super easy setup
- ✅ One-click deployments

### Steps:

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. For Backend:
   - Click "Add Service" → "GitHub Repo"
   - Set root directory to `backend`
   - Add all environment variables
   - Deploy!
6. For Frontend:
   - Repeat for `frontend` directory
   - Add environment variables
   - Deploy!

---

## 🌐 Alternative: Vercel (Best for Frontend)

**Why Vercel?**
- ✅ Excellent for React apps
- ✅ Free tier
- ✅ Fast global CDN
- ⚠️ Backend needs to be deployed separately (or use serverless functions)

### Deploy Frontend on Vercel:

1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add Environment Variables (same as above)
6. Deploy!

**For Backend**: Deploy separately on Render or Railway.

---

## 📝 Important Notes

### Environment Variables

Before deploying, make sure you have these ready:

**Backend `.env`:**
```env
PORT=10000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
PRIVATE_KEY=your_private_key
RPC_URL=https://rpc-amoy.polygon.technology
CHAIN_ID=80002
CONTRACT_ADDRESS=0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA
```

**Frontend Environment Variables:**
```env
REACT_APP_API_URL=your_backend_url_here
REACT_APP_CHAIN_ID=80002
REACT_APP_POLYGONSCAN_URL=https://amoy.polygonscan.com
REACT_APP_CONTRACT_ADDRESS=0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA
```

### Update Frontend API URL

After deploying backend, update `REACT_APP_API_URL` in frontend environment variables to point to your deployed backend URL.

### Free Tier Limitations

- **Render**: Free tier may sleep after inactivity (takes a few seconds to wake up)
- **Railway**: $5 free credit monthly (usually enough for testing)
- **Vercel**: Generous free tier, no sleep

---

## 🎯 Recommended Approach for Beginners

**Best Combo:**
1. **Backend**: Deploy on **Railway** (easiest, no sleep)
2. **Frontend**: Deploy on **Vercel** (fast, reliable)

Or everything on **Render** (one platform, simpler).

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed with all environment variables
- [ ] Backend URL copied
- [ ] Frontend environment variables updated with backend URL
- [ ] Frontend deployed
- [ ] Test the deployed app!
- [ ] Share your live URL! 🎉

---

## 🆘 Troubleshooting

### "Backend URL not found"
- Make sure `REACT_APP_API_URL` in frontend points to your deployed backend
- Check backend is running (visit backend URL + `/health`)

### "CORS errors"
- Backend should have `cors` enabled (already in your code ✅)
- Make sure frontend URL is allowed in CORS settings if needed

### "Environment variables not working"
- In Render/Vercel/Railway, make sure variables are set in the dashboard
- Restart deployment after adding variables
- For React, variables MUST start with `REACT_APP_`

---

## 🎉 You're Done!

Once deployed, your app will be live and accessible from anywhere!

Share your deployed URL and celebrate! 🚀

