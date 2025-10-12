# Script para testar todas as exceções do sistema
Write-Host "=== TESTE DO SISTEMA DE EXCEÇÕES ===" -ForegroundColor Green
Write-Host ""

# Função para executar teste e mostrar resultado
function Testar-Excecao {
    param($nome, $url, $metodo = "GET", $body = $null)
    
    Write-Host "Testando: $nome" -ForegroundColor Yellow
    try {
        if ($metodo -eq "POST" -or $metodo -eq "PUT") {
            $response = Invoke-WebRequest -Uri $url -Method $metodo -Body $body -ContentType "application/json"
            Write-Host "❌ ERRO: Deveria ter falhado mas retornou sucesso" -ForegroundColor Red
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $metodo
            Write-Host "❌ ERRO: Deveria ter falhado mas retornou sucesso" -ForegroundColor Red
        }
    } catch {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        $reader.Close()
        
        Write-Host "✅ SUCESSO: Exceção capturada corretamente" -ForegroundColor Green
        Write-Host "Resposta: $errorContent" -ForegroundColor Cyan
    }
    Write-Host ""
}

# Teste 1: ID Inválido
Testar-Excecao "ID Negativo" "http://localhost:8080/astronautas/-1"
Testar-Excecao "ID Zero" "http://localhost:8080/astronautas/0"

# Teste 2: Recurso Não Encontrado
Testar-Excecao "ID Inexistente" "http://localhost:8080/astronautas/99999"

# Teste 3: Nome Inválido
Testar-Excecao "Nome Vazio" "http://localhost:8080/astronautas/buscar?nome="
Testar-Excecao "Nome Muito Curto" "http://localhost:8080/astronautas/buscar?nome=A"

# Teste 4: Nível de Aptidão Inválido
Testar-Excecao "Nível com Números" "http://localhost:8080/astronautas/buscar-aptidao?nivel=123"
Testar-Excecao "Nível Inválido" "http://localhost:8080/astronautas/buscar-aptidao?nivel=INVALIDO"

# Teste 5: Criação com Dados Inválidos
$bodyInvalido = @{
    nome = ""
    idade = 15
    ativo = $true
    nivelAptidaoMedica = "INVALIDO"
    missoesRealizadas = -5
} | ConvertTo-Json

Testar-Excecao "Criação com Dados Inválidos" "http://localhost:8080/astronautas" "POST" $bodyInvalido

# Teste 6: Dados Biométricos Inválidos
$bodyBiometrico = @{
    nome = "Teste Biometria"
    idade = 30
    ativo = $true
    nivelAptidaoMedica = "A"
    missoesRealizadas = 0
    tipoBiometria = "TIPO_INEXISTENTE"
    valorBiometria = "abc"
    unidadeBiometria = ""
} | ConvertTo-Json

Testar-Excecao "Dados Biométricos Inválidos" "http://localhost:8080/astronautas" "POST" $bodyBiometrico

Write-Host "=== TESTES CONCLUÍDOS ===" -ForegroundColor Green
