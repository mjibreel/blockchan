# Deployment Guide

## Table of Contents

1. [Frontend Deployment (Netlify)](#frontend-deployment-netlify)
2. [Backend Deployment (Vercel)](#backend-deployment-vercel)
3. [Smart Contract Deployment](#smart-contract-deployment)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment Checklist](#post-deployment-checklist)

## Frontend Deployment (Netlify)

### Prerequisites
- GitHub repository connected
- Netlify account

### Steps

1. **Connect Repository**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository

2. **Configure Build Settings**
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `build`

3. **Add Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend.vercel.app
   REACT_APP_CHAIN_ID=80002
   REACT_APP_POLYGONSCAN_URL=https://amoy.polygonscan.com
   REACT_APP_CONTRACT_ADDRESS=0x...
   ```

4. **Deploy**
   - Netlify will auto-deploy on push to `main`
   - Or click "Deploy site" for manual deploy

### Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS records as instructed

## Backend Deployment (Vercel)

### Prerequisites
- GitHub repository connected
- Vercel account

### Steps

1. **Import Project**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**
   - Framework Preset: Other
   - Root Directory: `backend`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

3. **Add Environment Variables**
   ```
   PORT=3001
   SUPABASE_URL=https://...
   SUPABASE_SERVICE_KEY=...
   PRIVATE_KEY=...
   RPC_URL=https://...
   CHAIN_ID=80002
   CONTRACT_ADDRESS=0x...
   ```

4. **Deploy**
   - Vercel will auto-deploy on push
   - First deployment may take 2-3 minutes

### Serverless Functions

Vercel automatically converts Express routes to serverless functions. The `vercel.json` configuration handles routing.

## Smart Contract Deployment

### Polygon Amoy

```bash
cd contracts
npm run deploy:amoy
```

**Output:**
- Contract address will be displayed
- Save to `backend/.env` as `CONTRACT_ADDRESS`
- Save to `frontend/.env` as `REACT_APP_CONTRACT_ADDRESS`

### Base Sepolia

```bash
npm run deploy:base-sepolia
```

**Required:**
- Get testnet tokens from Coinbase faucet
- Update `frontend/.env`: `REACT_APP_CONTRACT_ADDRESS_BASE`

### Ethereum Sepolia

```bash
npm run deploy:ethereum-sepolia
```

**Required:**
- Get testnet tokens from Alchemy faucet
- Update `frontend/.env`: `REACT_APP_CONTRACT_ADDRESS_ETHEREUM`

### Arbitrum Sepolia

```bash
npm run deploy:arbitrum-sepolia
```

**Required:**
- Get testnet tokens from QuickNode faucet
- Update `frontend/.env`: `REACT_APP_CONTRACT_ADDRESS_ARBITRUM`

## Environment Variables

### Frontend (Netlify)

Add in Netlify dashboard → Site settings → Environment variables:

```env
REACT_APP_API_URL=https://your-backend.vercel.app
REACT_APP_CHAIN_ID=80002
REACT_APP_POLYGONSCAN_URL=https://amoy.polygonscan.com
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_CONTRACT_ADDRESS_POLYGON=0x...
REACT_APP_CONTRACT_ADDRESS_BASE=0x...
REACT_APP_CONTRACT_ADDRESS_ETHEREUM=0x...
REACT_APP_CONTRACT_ADDRESS_ARBITRUM=0x...
```

### Backend (Vercel)

Add in Vercel dashboard → Project settings → Environment variables:

```env
PORT=3001
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
PRIVATE_KEY=0x...
RPC_URL=https://rpc-amoy.polygon.technology
CHAIN_ID=80002
CONTRACT_ADDRESS=0x...
```

### Contracts (Local)

Create `contracts/.env`:

```env
RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=0x...
```

## Post-Deployment Checklist

### Frontend
- [ ] Test wallet connection
- [ ] Test file stamping
- [ ] Test file verification
- [ ] Test transaction history
- [ ] Test chain selector
- [ ] Check mobile responsiveness
- [ ] Verify environment variables

### Backend
- [ ] Test `/health` endpoint
- [ ] Test `/api/stamp` endpoint
- [ ] Test `/api/verify` endpoint
- [ ] Test `/api/history/:address` endpoint
- [ ] Verify Supabase connection
- [ ] Verify blockchain connection

### Smart Contracts
- [ ] Verify contract on block explorer
- [ ] Test contract functions
- [ ] Verify events are emitted
- [ ] Check gas costs
- [ ] Document contract address

### Integration
- [ ] Frontend can reach backend API
- [ ] Backend can reach blockchain
- [ ] Transactions are visible on explorer
- [ ] History page loads correctly
- [ ] Multi-chain switching works

## Troubleshooting

### Frontend Issues

**Build fails:**
- Check for linting errors
- Verify all environment variables are set
- Check Netlify build logs

**API calls fail:**
- Verify `REACT_APP_API_URL` is correct
- Check CORS configuration on backend
- Verify backend is deployed

### Backend Issues

**500 errors:**
- Check Vercel function logs
- Verify environment variables
- Check RPC endpoint connectivity
- Verify contract address

**RPC timeouts:**
- Use different RPC endpoint
- Check network status
- Increase timeout values

### Contract Issues

**Deployment fails:**
- Check private key is correct
- Verify RPC URL is working
- Ensure wallet has enough tokens
- Check network configuration

## Monitoring

### Netlify
- View build logs in dashboard
- Monitor site analytics
- Check form submissions
- Review function invocations

### Vercel
- Monitor function logs
- Check error rates
- View analytics
- Monitor performance

### Blockchain
- Monitor transactions on explorer
- Check contract interactions
- Verify event emissions
- Track gas usage

## Rollback

### Frontend Rollback
1. Go to Netlify dashboard
2. Navigate to Deploys
3. Find previous successful deploy
4. Click "Publish deploy"

### Backend Rollback
1. Go to Vercel dashboard
2. Navigate to Deployments
3. Find previous deployment
4. Click "Promote to Production"

### Contract Rollback
- Contracts are immutable
- Deploy new version if needed
- Update contract address in config
- Redeploy frontend/backend

---

For detailed troubleshooting, see [README.md](../README.md#troubleshooting)

