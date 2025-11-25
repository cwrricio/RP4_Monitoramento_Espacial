# 🚀 Como Rodar a Aplicação Espacial

## 📋 Problemas Identificados e Soluções

### ✅ RESOLVIDO: Docker python-simulator fechava
**Problema**: Container `python-simulator` iniciava e fechava imediatamente
**Causa**: Dockerfile tentava importar `api.api:app` em vez de `api.main:app`
**Solução**: Corrigido no `simulacao-python/Dockerfile`

### ✅ IDENTIFICADO: WebSocket não conecta durante simulação
**Problema**: Animação não aparece porque WebSocket não está ativo
**Causa**: Frontend executa simulação antes de estabelecer conexão WebSocket
**Status**: 0 conexões WebSocket ativas durante simulação

## 🎯 Como Rodar Corretamente

### 1️⃣ Iniciar Backend (Docker)
```bash
# No diretório raiz
docker-compose up -d
```

**Resultados esperados:**
- ✅ `monitoramento-db` (PostgreSQL) - porta 5432
- ✅ `python-simulator` (FastAPI) - porta 8000
- ⚠️ `monitoramento-espacial-app` (Spring Boot) - porta 8080 (opcional)

### 2️⃣ Iniciar Frontend
```bash
# Em outro terminal
cd frontend/space-control-center
npm install  # primeira vez apenas
npm run dev
```

**Resultado esperado:**
- ✅ Frontend Next.js rodando em `http://localhost:3000` ou `3001`

### 3️⃣ Verificar Status
```bash
# Verificar containers
docker ps

# Testar APIs
curl http://localhost:8000/health    # Python: {"status":"healthy"}
curl http://localhost:8080/health    # Java: (opcional)
```

## 🌐 Acessar a Aplicação

1. **Abrir navegador:** `http://localhost:3000` (ou 3001)
2. **Navegar para Missões**
3. **Criar ou selecionar uma missão**
4. **Clicar em "Iniciar Simulação"**

## ⚠️ Problema da Animação (Em Investigação)

**Sintomas:**
- ✅ WebSocket conecta: "WebSocket Conectado" aparece
- ✅ Simulação executa: Status muda para "Concluída" 
- ❌ Animação não aparece: Canvas fica em branco

**Causa Identificada:**
```
🔄 Enviando atualização WebSocket: 0 conexões ativas
📊 Dados: status=EXECUTANDO, progresso=91.74%
```

O WebSocket desconecta antes da simulação começar.

**Próximos Passos de Debug:**
1. Manter conexão WebSocket ativa durante execução
2. Verificar timing entre conexão WS e execução de simulação
3. Implementar reconexão automática

## 📊 Status dos Serviços

| Componente | Status | URL | Descrição |
|------------|--------|-----|-----------|
| 🐘 PostgreSQL | ✅ Funcionando | `localhost:5432` | Banco de dados |
| 🐍 Python API | ✅ Funcionando | `http://localhost:8000` | Simulações e WebSocket |
| ☕ Java API | ⚠️ Opcional | `http://localhost:8080` | Backend principal |
| ⚛️ Frontend | ✅ Funcionando | `http://localhost:3000` | Interface web |
| 🔗 WebSocket | ⚠️ Parcial | `ws://localhost:8000/ws` | Conecta mas desconecta |

## 🔧 Comandos Úteis

### Logs e Debug
```bash
# Ver logs do Python
docker logs python-simulator --follow

# Ver logs em tempo real
docker-compose logs -f python-simulator

# Reiniciar apenas Python
docker-compose restart python-simulator
```

### Parar/Limpar
```bash
# Parar tudo
docker-compose down

# Limpar e reconstruir
docker-compose down
docker-compose up --build -d
```

### Testar WebSocket
```bash
# Testar simulação via API
curl -X POST http://localhost:8000/simulacoes/foguete \
  -H "Content-Type: application/json" \
  -d '{"tempo_maximo": 5, "massa_inicial": 1000}'
```

## 🐛 Troubleshooting

### Docker não inicia
```bash
# Verificar Docker está rodando
docker --version
docker ps

# Reiniciar Docker Desktop (Windows/Mac)
```

### Porta em uso
```bash
# Windows - verificar portas
netstat -ano | findstr ":3000"
netstat -ano | findstr ":8000"

# Matar processo
taskkill /F /PID [número_do_pid]
```

### Frontend não carrega
```bash
cd frontend/space-control-center
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Python API não responde
```bash
# Verificar se container está rodando
docker ps | grep python-simulator

# Verificar logs
docker logs python-simulator

# Reconstruir se necessário
docker-compose up python-simulator --build -d
```

---

## 📝 Resumo

**✅ O que está funcionando:**
- Docker containers iniciam corretamente
- Python API responde (`/health`, `/simulacoes/foguete`)
- Frontend carrega e conecta WebSocket
- Simulações executam e completam

**⚠️ O que precisa ajuste:**
- Animação em tempo real não aparece
- WebSocket desconecta durante simulação
- Timing entre conexão WS e execução de simulação

**🎯 Para uso básico:** A aplicação está funcional para criar missões e executar simulações, apenas a visualização em tempo real precisa ser ajustada.
