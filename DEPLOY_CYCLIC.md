# 🚀 Deploy to Cyclic (100% FREE - No Credit Card!)

Cyclic is perfect for your blockchain app - completely free and supports both frontend and backend!

## Step 1: Deploy Backend on Cyclic

1. Go to **https://cyclic.sh**
2. Click **"Sign Up"** → Sign in with **GitHub**
3. Click **"Create App"** or **"New App"**
4. Select your repository: **mjibreel/blockchan**
5. Configure:
   - **Framework**: Node.js
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Click **"Create App"**

### Add Environment Variables:
Go to your app → **"Variables"** tab → Add these:

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

7. **Copy your backend URL** (e.g., `https://qubic-backend.cyclic.app`)

## Step 2: Deploy Frontend on Vercel (FREE)

1. Go to **https://vercel.com**
2. Sign up with **GitHub** (if not already)
3. Click **"Add New..."** → **"Project"**
4. Import repository: **mjibreel/blockchan**
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend` ⚠️ **Change this!**
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://qubic-backend.cyclic.app
   REACT_APP_CHAIN_ID=80002
   REACT_APP_POLYGONSCAN_URL=https://amoy.polygonscan.com
   REACT_APP_CONTRACT_ADDRESS=0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA
   ```
   ⚠️ **Important**: Replace `https://qubic-backend.cyclic.app` with your actual Cyclic backend URL from Step 1!

7. Click **"Deploy"**

## ✅ Done!

Your app will be live at your Vercel URL!

**Example URLs:**
- Backend: `https://qubic-backend.cyclic.app`
- Frontend: `https://qubic-frontend.vercel.app`

---

## 🔄 Alternative: All on Cyclic

Cyclic can also host static sites! For frontend:

1. Create another Cyclic app
2. Set root directory to `frontend`
3. Configure as static site
4. Deploy!

---

## 🎉 Advantages of This Setup:

- ✅ **100% FREE** - No credit card needed
- ✅ **No payment required**
- ✅ **Auto-deploys** from GitHub
- ✅ **Reliable** - Both services are well-established
- ✅ **Fast** - Vercel's CDN is excellent

---

**Ready to deploy?** Start with Step 1!

