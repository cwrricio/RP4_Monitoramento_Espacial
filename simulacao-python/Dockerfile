# 1. Imagem base do Python
FROM python:3.13-slim

# 2. Diretório de trabalho dentro do container
WORKDIR /app

# 3. Copiar os arquivos do projeto
COPY . .

# 4. Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# 5. Expor a porta da API
EXPOSE 8000

# 6. Comando para rodar a API
CMD ["uvicorn", "api.api:app", "--host", "0.0.0.0", "--port", "8000"]
