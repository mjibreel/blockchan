# Deploy Qubic File Stamp to Render
# Prerequisites: Get your Render API token from https://dashboard.render.com/account/api-keys

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiToken,
    
    [Parameter(Mandatory=$false)]
    [string]$SupabaseUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$SupabaseKey,
    
    [Parameter(Mandatory=$false)]
    [string]$PrivateKey = "be1c2331d6579d0b1f82cca904f159b68fb07357f120a8b7a1aace85dd275549"
)

$ErrorActionPreference = "Stop"
$headers = @{
    "Accept" = "application/json"
    "Authorization" = "Bearer $ApiToken"
    "Content-Type" = "application/json"
}

Write-Host "Deploying Qubic File Stamp to Render..." -ForegroundColor Green
Write-Host ""

# Step 0: Get Owner ID
Write-Host "Getting account information..." -ForegroundColor Cyan
try {
    $ownerResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/owners" -Method Get -Headers $headers
    $ownerId = $ownerResponse[0].owner.id
    Write-Host "Owner ID: $ownerId" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Error getting owner ID: $_" -ForegroundColor Red
    Write-Host "Please check your API token and try again." -ForegroundColor Yellow
    exit 1
}

# Step 1: Deploy Backend
Write-Host "Step 1: Deploying Backend..." -ForegroundColor Cyan

$backendEnvVars = @(
    @{ key = "NODE_ENV"; value = "production" }
    @{ key = "PORT"; value = "10000" }
    @{ key = "RPC_URL"; value = "https://rpc-amoy.polygon.technology" }
    @{ key = "CHAIN_ID"; value = "80002" }
    @{ key = "CONTRACT_ADDRESS"; value = "0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA" }
    @{ key = "PRIVATE_KEY"; value = $PrivateKey }
)

if ($SupabaseUrl) {
    $backendEnvVars += @{ key = "SUPABASE_URL"; value = $SupabaseUrl }
}
if ($SupabaseKey) {
    $backendEnvVars += @{ key = "SUPABASE_SERVICE_KEY"; value = $SupabaseKey }
}

$backendBody = @{
    type = "web_service"
    name = "qubic-backend"
    ownerId = $ownerId
    serviceDetails = @{
        repo = "https://github.com/mjibreel/blockchan.git"
        branch = "main"
        rootDir = "backend"
        runtime = "node"
        buildCommand = "npm install"
        startCommand = "npm start"
        region = "oregon"
        envVars = $backendEnvVars
    }
}

try {
    $backendJson = $backendBody | ConvertTo-Json -Depth 10
    $backendResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method Post -Headers $headers -Body $backendJson
    $backendUrl = "https://$($backendResponse.service.serviceDetails.url)"
    Write-Host "Backend deployed successfully!" -ForegroundColor Green
    Write-Host "   Backend URL: $backendUrl" -ForegroundColor Yellow
    Write-Host "   Service ID: $($backendResponse.service.id)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Error deploying backend: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

# Wait a bit for backend to start
Write-Host "Waiting 10 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 2: Deploy Frontend
Write-Host "Step 2: Deploying Frontend..." -ForegroundColor Cyan

$frontendBody = @{
    type = "static_site"
    name = "qubic-frontend"
    ownerId = $ownerId
    serviceDetails = @{
        repo = "https://github.com/mjibreel/blockchan.git"
        branch = "main"
        rootDir = "frontend"
        buildCommand = "npm install; npm run build"
        publishPath = "build"
        envVars = @(
            @{ key = "REACT_APP_API_URL"; value = $backendUrl }
            @{ key = "REACT_APP_CHAIN_ID"; value = "80002" }
            @{ key = "REACT_APP_POLYGONSCAN_URL"; value = "https://amoy.polygonscan.com" }
            @{ key = "REACT_APP_CONTRACT_ADDRESS"; value = "0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA" }
        )
    }
}

try {
    $frontendJson = $frontendBody | ConvertTo-Json -Depth 10
    $frontendResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method Post -Headers $headers -Body $frontendJson
    $frontendUrl = "https://$($frontendResponse.service.serviceDetails.url)"
    Write-Host "Frontend deployed successfully!" -ForegroundColor Green
    Write-Host "   Frontend URL: $frontendUrl" -ForegroundColor Yellow
    Write-Host "   Service ID: $($frontendResponse.service.id)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "Error deploying frontend: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   Backend:  $backendUrl" -ForegroundColor White
Write-Host "   Frontend: $frontendUrl" -ForegroundColor White
Write-Host ""
Write-Host "Your app is live at: $frontendUrl" -ForegroundColor Green
Write-Host ""
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "   - First deployment may take 5-10 minutes"
Write-Host "   - Check deployment status at: https://dashboard.render.com"
Write-Host "   - Free tier services sleep after 15 min inactivity"
