# Matriz de Rastreabilidade de Requisitos e Artefatos

## Sistema de Controle e Monitoramento de Agência Espacial

**Documento:** Matriz de Rastreabilidade  
**Projeto:** RP4_Monitoramento_Espacial  
**Base:** Especificação de Requisitos - Sistema de Controle e Monitoramento de Agência Espacial (UNIPAMPA)  
**Data:** 22/03/2025  

---

## 1. Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Implementado / Atendido |
| ⚠️ | Parcialmente implementado |
| ❌ | Não implementado / Fora do escopo |
| N/A | Não aplicável |

---

## 2. Rastreabilidade: Requisitos Funcionais → Casos de Uso → Artefatos

### 2.1 Requisitos Essenciais (Must Have)

| ID | Requisito | Prioridade | UC Relacionados | Status | Artefatos de Código |
|----|-----------|------------|-----------------|--------|---------------------|
| **RF01** | Planejamento e Controle de Missões Espaciais (tripuladas e não tripuladas) | Essencial | UC-01, UC-02 | ✅ | `MissaoController`, `MissaoService`, `Missao`, `CriarMissaoRequest`, `AtualizarMissaoRequest`, `MissaoDTO`, `MissaoRepository`, `MissaoMapper` |
| **RF02** | Monitoramento em Tempo Real (dados operacionais e biométricos) | Essencial | UC-02, UC-04 | ⚠️ | `MissaoController.listarEventos()`, `Evento`, `EventoRepository`, `DadosBiometricos`, `AstronautaDTO` (inclui biometria). *Nota: Sem WebSocket/streaming em tempo real* |
| **RF06** | Gestão de Pessoal (astronautas e especialistas) | Essencial | UC-10 | ✅ | `AstronautaController`, `OperadorDeMissaoController`, `AstronautaService`, `OperadorDeMissaoService`, `Astronauta`, `OperadorDeMissao`, `Funcionario` |
| **RF07** | Monitoramento em Missões (dados fisiológicos de astronautas) | Essencial | UC-04 | ⚠️ | `DadosBiometricos`, `Astronauta.adicionarDadoBiometrico()`, `AstronautaService.atualizarAstronauta()` (aceita biometria), `AstronautaDTO`. *Nota: Sem API dedicada de coleta/streaming* |
| **RF13** | Resposta a Emergências (planos de resgate, evacuação e contingência) | Essencial | UC-03, UC-09, UC-11, UC-12 | ✅ | `MissaoController.acionarProtocolo()`, `ProtocoloEmergencial`, `TipoProtocolo` (MEDICO, TECNICO, EVACUACAO, COMUNICACAO, INCENDIO), `Missao.acionarProtocolo()`, `Evento` (TipoEvento.ALERTA) |

### 2.2 Requisitos Importantes (Should Have)

| ID | Requisito | Prioridade | UC Relacionados | Status | Artefatos de Código |
|----|-----------|------------|-----------------|--------|---------------------|
| **RF04** | Simulações e Previsão de Falhas | Importante | UC-05, UC-12 | ⚠️ | `Simulacao`, `ResultadoSimulacao`, `Missao.iniciarSimulacao()`, `MissaoController.iniciarSimulacao()`. *Nota: Estrutura básica; sem motor de simulação preditiva* |
| **RF11** | Monitoramento de Ameaças Espaciais | Importante | UC-07 | ✅ | `AmeacaController`, `AmeacaService`, `Ameaca`, `TipoAmeaca`, `RegistrarAmeacaRequest`, `listarAmeacasCriticas()` |
| **RF12** | Interoperabilidade Internacional | Importante | UC-08 | ❌ | Nenhum artefato. *REST API preparada para integração externa* |

### 2.3 Requisitos Desejáveis (Could Have)

| ID | Requisito | Prioridade | UC Relacionados | Status | Artefatos de Código |
|----|-----------|------------|-----------------|--------|---------------------|
| **RF03-B** | Integração com Observatórios e Telescópios | Desejável | UC-06 | ❌ | Pastas `interfaceExterna`, `hardware` com .gitkeep. Sem integração implementada |

---

## 3. Rastreabilidade: Casos de Uso → Artefatos

| UC | Caso de Uso | Ator Principal | Status | Artefatos Principais |
|----|-------------|----------------|--------|----------------------|
| **UC-01** | Planejar missão espacial | Operador de missão | ✅ | `MissaoController.criar()`, `MissaoController.atualizar()`, `MissaoService`, `CriarMissaoRequest` |
| **UC-02** | Monitorar missão | Operador de missão | ✅ | `MissaoController.listarTodas()`, `buscarPorId()`, `listarEventos()`, `Evento`, `EventoRepository` |
| **UC-03** | Ativar protocolo de emergência | Operador de missão, Simulador | ✅ | `MissaoController.acionarProtocolo()`, `ProtocoloEmergencial`, `TipoProtocolo` |
| **UC-04** | Monitorar dados de astronautas | Operador de missão | ⚠️ | `AstronautaController.buscarPorId()`, `AstronautaDTO` (biometria), `DadosBiometricos`. Sem painel em tempo real |
| **UC-05** | Executar simulação de missão | Simulador | ⚠️ | `MissaoController.iniciarSimulacao()`, `Simulacao`, `ResultadoSimulacao` |
| **UC-06** | Integrar dados de observatórios | Consultor Astronômico | ❌ | Não implementado |
| **UC-07** | Monitorar ameaças | Simulador | ✅ | `AmeacaController`, `AmeacaService`, `listarPorMissao()`, `listarCriticas()` |
| **UC-08** | Compartilhar dados com agências | - | ❌ | Não implementado (RF12) |
| **UC-09** | Emitir alerta | Sistema, Operador | ⚠️ | `AmeacaService` (gera Evento ALERTA para ameaças críticas). Sem envio para órgãos externos |
| **UC-10** | Gerenciar pessoal | - | ✅ | `AstronautaController`, `OperadorDeMissaoController` (CRUD completo) |
| **UC-11** | Ação de emergência (operador inoperante) | Sistema | ❌ | Não implementado (ação autônoma do sistema) |
| **UC-12** | Executar simulação de contingência | Operador, Simulador | ⚠️ | Estrutura `Simulacao` existe; sem fluxo específico de contingência |

---

## 4. Rastreabilidade: Requisitos Não Funcionais

| ID | Requisito | Prioridade | Status | Artefatos / Evidências |
|----|-----------|------------|--------|------------------------|
| **NF01** | Segurança Cibernética Avançada | Essencial | ⚠️ | Spring Boot padrão. Sem autenticação/autorização, Spring Security ou proteção específica contra espionagem |
| **NF02** | Confiabilidade e Integridade | Essencial | ✅ | JPA/Hibernate, validação (`@Valid`), `RestExceptionHandler`, transações `@Transactional` |
| **NF03** | Desempenho e Baixa Latência | Essencial | ⚠️ | Spring Boot, JPA com `FetchType.LAZY`. Sem otimizações específicas para tempo real |
| **NF04** | Armazenamento de Grandes Volumes | Essencial | ⚠️ | PostgreSQL via JPA. Sem particionamento ou estratégias de big data |
| **NF05** | Alta Disponibilidade e Redundância | Importante | ❌ | Sem clusterização, failover ou redundância configurada |
| **NF06** | Escalabilidade | Importante | ⚠️ | Docker, Spring Boot. Arquitetura permite escalar horizontalmente; sem provas explícitas |
| **NF07** | Backup e Recuperação de Desastres | Desejável | ❌ | Sem scripts ou políticas de backup documentadas |

---

## 5. Rastreabilidade: Artefatos de Domínio → Diagrama de Classes

| Entidade de Domínio | Arquivo | Descrição |
|--------------------|---------|-----------|
| Missao | `dominio/Missao.java` | Missão espacial com tripulação, espaçonave, eventos, protocolos e simulações |
| Astronauta | `dominio/Astronauta.java` | Tripulante com dados biométricos e aptidão médica |
| OperadorDeMissao | `dominio/OperadorDeMissao.java` | Especialista que opera missões (herda Funcionario) |
| Espaconave | `dominio/Espaconave.java` | Veículo espacial com capacidade e status operacional |
| Ameaca | `dominio/Ameaca.java` | Ameaça espacial com tipo, nível de perigo e distância |
| Evento | `dominio/Evento.java` | Log/alerta (INFO, ALERTA, ERRO_CRITICO) |
| ProtocoloEmergencial | `dominio/ProtocoloEmergencial.java` | Protocolo acionado em emergências |
| Simulacao | `dominio/Simulacao.java` | Simulação vinculada à missão |
| DadosBiometricos | `dominio/DadosBiometricos.java` | Dados fisiológicos do astronauta |
| Funcionario | `dominio/Funcionario.java` | Classe base para Astronauta e OperadorDeMissao |

---

## 6. Rastreabilidade: Endpoints REST → Casos de Uso

| Endpoint | Método | Caso de Uso | Requisito |
|----------|--------|-------------|-----------|
| `/missoes` | POST | UC-01 | RF01 |
| `/missoes` | PUT /{id} | UC-01 | RF01 |
| `/missoes` | GET | UC-02 | RF02 |
| `/missoes/{id}` | GET | UC-02 | RF02 |
| `/missoes/{id}/eventos` | GET | UC-02 | RF02 |
| `/missoes/{id}/protocolos` | POST | UC-03 | RF13 |
| `/missoes/{id}/protocolos` | GET | UC-03 | RF13 |
| `/missoes/{id}/iniciar-simulacao` | POST | UC-05, UC-12 | RF04 |
| `/missoes/{id}/concluir` | POST | UC-02 | RF01 |
| `/astronautas` | POST, GET, PUT, DELETE | UC-10, UC-04 | RF06, RF07 |
| `/operadores` | POST, GET, DELETE | UC-10 | RF06 |
| `/ameacas` | POST | UC-07 | RF11 |
| `/ameacas/missao/{missaoId}` | GET | UC-07 | RF11 |
| `/ameacas/criticas` | GET | UC-07, UC-09 | RF11 |
| `/espaconaves` | POST, GET, PUT, DELETE | UC-01 | RF01 |

---

## 7. Resumo da Cobertura

| Categoria | Total | Implementados | Parciais | Não Implementados |
|-----------|-------|---------------|----------|-------------------|
| RF Essenciais | 5 | 3 | 2 | 0 |
| RF Importantes | 3 | 1 | 1 | 1 |
| RF Desejáveis | 1 | 0 | 0 | 1 |
| NF Essenciais | 4 | 1 | 3 | 0 |
| NF Importantes | 2 | 0 | 1 | 1 |
| NF Desejáveis | 1 | 0 | 0 | 1 |
| Casos de Uso | 12 | 6 | 4 | 2 |

---

## 8. Recomendações de Evolução

1. **RF02/RF07 – Tempo Real:** Implementar WebSocket ou Server-Sent Events para streaming de telemetria e dados biométricos.
2. **RF04 – Simulações:** Desenvolver motor de simulação com cenários preditivos e análise de riscos.
3. **RF12 – Interoperabilidade:** Definir contratos de API e mecanismos de troca segura com outras agências.
4. **UC-11 – Ação Autônoma:** Implementar lógica de contingência quando o operador não responde.
5. **NF01 – Segurança:** Integrar Spring Security com autenticação e autorização por perfis.
6. **NF05/NF07:** Documentar e implementar estratégias de HA e backup.

---

*Documento gerado com base na análise do código-fonte e na Especificação de Requisitos fornecida.*
