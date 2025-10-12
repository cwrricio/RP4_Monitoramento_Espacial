# Mensagem de Commit

## Título
```
feat: implementar sistema de exceções personalizadas com @ControllerAdvice
```

## Descrição Detalhada
```
Implementa sistema robusto de tratamento de exceções para o sistema de monitoramento espacial:

### Exceções Criadas:
- RecursoNaoEncontradoException: Para recursos não encontrados (404)
- ParametroInvalidoException: Para parâmetros inválidos (400)

### Funcionalidades Implementadas:
- GlobalExceptionHandler com @ControllerAdvice para tratamento centralizado
- Validações específicas no AstronautaService:
  * Validação de ID (deve ser positivo)
  * Validação de nome (2-100 caracteres)
  * Validação de nível de aptidão médica (A, B, C, D, APTO, INAPTO, RESTRITO)
  * Validação de idade (18-65 anos)
  * Validação de missões realizadas (não negativo)
  * Validação de dados biométricos (tipo, valor numérico, unidade)

### Respostas Padronizadas:
- JSON com timestamp, status, error, message e path
- Códigos HTTP apropriados (400, 404, 500)
- Mensagens de erro claras e específicas

### Arquivos Modificados:
- src/main/java/com/MonitoramentoEspacial/aplicacao/GlobalExceptionHandler.java
- src/main/java/com/MonitoramentoEspacial/aplicacao/AstronautaService.java
- src/main/java/com/MonitoramentoEspacial/aplicacao/RecursoNaoEncontradoException.java
- src/main/java/com/MonitoramentoEspacial/aplicacao/ParametroInvalidoException.java

### Arquivos de Teste:
- testar-excecoes.ps1: Script para testar todas as exceções
- executar-sistema.ps1: Script para executar o sistema completo
- test-astronauta-invalido.json: Dados para teste de criação inválida
- test-atualizacao-invalida.json: Dados para teste de atualização inválida

### Melhorias:
- Tratamento centralizado de erros
- Validações robustas de entrada
- Respostas consistentes para o cliente
- Facilita debugging e manutenção
- Melhora experiência do usuário com mensagens claras
```

## Comando Git
```bash
git add .
git commit -m "feat: implementar sistema de exceções personalizadas com @ControllerAdvice

Implementa sistema robusto de tratamento de exceções para o sistema de monitoramento espacial:

- RecursoNaoEncontradoException: Para recursos não encontrados (404)
- ParametroInvalidoException: Para parâmetros inválidos (400)
- GlobalExceptionHandler com @ControllerAdvice para tratamento centralizado
- Validações específicas no AstronautaService para todos os campos
- Respostas JSON padronizadas com timestamp, status, error, message e path
- Códigos HTTP apropriados (400, 404, 500)
- Scripts de teste automatizados para validar todas as exceções

Melhora significativamente a robustez e usabilidade da API."
```

## Comando Completo para Executar
```powershell
# 1. Adicionar arquivos
git add .

# 2. Fazer commit
git commit -m "feat: implementar sistema de exceções personalizadas com @ControllerAdvice

Implementa sistema robusto de tratamento de exceções para o sistema de monitoramento espacial:

- RecursoNaoEncontradoException: Para recursos não encontrados (404)
- ParametroInvalidoException: Para parâmetros inválidos (400)
- GlobalExceptionHandler com @ControllerAdvice para tratamento centralizado
- Validações específicas no AstronautaService para todos os campos
- Respostas JSON padronizadas com timestamp, status, error, message e path
- Códigos HTTP apropriados (400, 404, 500)
- Scripts de teste automatizados para validar todas as exceções

Melhora significativamente a robustez e usabilidade da API."

# 3. Push (se necessário)
git push origin main
```
