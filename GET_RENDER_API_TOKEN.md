# 🔑 How to Get Render API Token

## Step-by-Step Guide

### Method 1: Direct Link
1. Go to: **https://dashboard.render.com/account/api-keys**
2. Click **"New API Key"** button
3. Give it a name (e.g., "Qubic Deployment")
4. Click **"Create API Key"**
5. **Copy the token immediately** ⚠️ (you won't see it again!)

### Method 2: Through Dashboard
1. Go to https://dashboard.render.com
2. Click your **profile icon** (top right)
3. Click **"Account Settings"**
4. Click **"API Keys"** in the left sidebar
5. Click **"New API Key"**
6. Name it and create
7. **Copy the token**

---

## Using the Token

Once you have the token, you can deploy using the script:

```powershell
.\deploy-to-render.ps1 -ApiToken "YOUR_TOKEN_HERE" -SupabaseUrl "YOUR_SUPABASE_URL" -SupabaseKey "YOUR_SUPABASE_KEY"
```

Or deploy manually using the dashboard.

---

## Important Notes

- ⚠️ **Keep your API token secret!** Don't share it or commit it to GitHub
- The token gives full access to your Render account
- You can create multiple tokens for different purposes
- You can revoke tokens anytime from the same page

---

## Troubleshooting

**Can't find API Keys?**
- Make sure you're logged into Render
- Try the direct link: https://dashboard.render.com/account/api-keys

**Token not working?**
- Make sure you copied the entire token (it's long)
- Check for any extra spaces
- Try creating a new token

