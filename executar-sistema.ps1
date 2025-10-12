# Script para executar o sistema completo de monitoramento espacial
Write-Host "=== SISTEMA DE MONITORAMENTO ESPACIAL ===" -ForegroundColor Green
Write-Host "Iniciando sistema..." -ForegroundColor Yellow

# 1. Verificar Docker
Write-Host "1. Verificando Docker..." -ForegroundColor Cyan
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
    Write-Host "✅ Docker está instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está instalado ou não está no PATH" -ForegroundColor Red
    exit 1
}

# 2. Parar containers existentes
Write-Host "2. Parando containers existentes..." -ForegroundColor Cyan
docker-compose down --remove-orphans 2>$null

# 3. Iniciar sistema
Write-Host "3. Iniciando sistema..." -ForegroundColor Cyan
docker-compose up -d

# 4. Verificar status
Write-Host "4. Verificando status dos containers..." -ForegroundColor Cyan
Start-Sleep 5
docker-compose ps

# 5. Aguardar aplicação inicializar
Write-Host "5. Aguardando aplicação inicializar (30 segundos)..." -ForegroundColor Cyan
Start-Sleep 30

# 6. Testar API
Write-Host "6. Testando API..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/astronautas" -Method GET
    Write-Host "✅ API está funcionando (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ API não está respondendo" -ForegroundColor Red
    Write-Host "Verificando logs..." -ForegroundColor Yellow
    docker-compose logs app
    exit 1
}

# 7. Executar testes de exceções
Write-Host "7. Executando testes de exceções..." -ForegroundColor Cyan
if (Test-Path "testar-excecoes.ps1") {
    .\testar-excecoes.ps1
} else {
    Write-Host "⚠️ Script de testes não encontrado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== SISTEMA PRONTO ===" -ForegroundColor Green
Write-Host "API disponível em: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Para ver logs: docker-compose logs -f app" -ForegroundColor Cyan
Write-Host "Para parar: docker-compose down" -ForegroundColor Cyan
