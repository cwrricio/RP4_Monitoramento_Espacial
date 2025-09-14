# Spring Boot + Docker — Starter

## Requisitos
- Docker Desktop (Windows/macOS) ou Docker Engine (Linux)

## Como rodar 

```bash
git clone 
# dentro da pasta do projeto
docker compose up --build
```
Acesse: http://localhost:8080

### Endpoints
- `GET /` → retorna um JSON com `message` e `status`
- `GET /health` → retorna `{ "status": "UP" }`

## Como parar
- `Ctrl+C` para parar o compose em primeiro plano
- Em segundo plano: `docker compose up -d` / `docker compose down`

## Estrutura
```
src/main/java/com/example/demo/DemoApplication.java
src/main/java/com/example/demo/HelloController.java
src/main/resources/application.properties
pom.xml
Dockerfile
docker-compose.yml
```

