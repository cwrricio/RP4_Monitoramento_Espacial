from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
from enum import Enum
import json
from core.main import RocketSimulation, CriarSimulacao, EventoEmergencia, Gravidade

app = FastAPI(title="Sistema de Simulação de Foguetes", version="1.0.0")

class TipoSimulacao(str, Enum):
    FOGUETE = "Foguete"
    OUTRO = "Outro"

class SimulacaoRequest(BaseModel):
    descricao: str = "Simulação de Lançamento de Foguete"
    tempo_maximo: int = 600
    massa_inicial: float = 549000
    massa_combustivel: float = 507000
    empuxo: float = 7607000
    tipo: TipoSimulacao = TipoSimulacao.FOGUETE

class EmergenciaRequest(BaseModel):
    descricao: str
    gravidade: int = 2  # 1=Baixa, 2=Média, 3=Alta, 4=Crítica

class SimulacaoResponse(BaseModel):
    id: str
    descricao: str
    tipo: str
    resultado: str
    data_execucao: str
    detalhes: dict

class EmergenciaResponse(BaseModel):
    evento_id: str
    descricao: str
    data_deteccao: str
    resolvido: bool
    protocolos_ativados: list

# Armazenamento em memória (em produção, usar banco de dados)
simulacoes = {}
eventos_emergencia = {}

@app.post("/simulacoes", response_model=SimulacaoResponse)
def criar_e_executar_simulacao(request: SimulacaoRequest):
    """Cria e executa uma nova simulação"""
    try:
        # Criar simulação usando a função do diagrama
        simulacao = CriarSimulacao()
        simulacao.descricao = request.descricao
        simulacao.tipo = request.tipo
        
        # Configurar parâmetros específicos do foguete
        if isinstance(simulacao, RocketSimulation):
            simulacao.t_max = request.tempo_maximo
            simulacao.m0 = request.massa_inicial
            simulacao.m_propellant = request.massa_combustivel
            simulacao.thrust = request.empuxo
        
        # Executar simulação
        simulacao.executarSimulacao()
        
        # Processar resultados
        sucesso = simulacao.processarSimulacao()
        if not sucesso:
            raise HTTPException(status_code=500, detail="Falha no processamento da simulação")
        
        # Armazenar simulação
        simulacao_id = f"sim_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        simulacoes[simulacao_id] = simulacao
        
        # Preparar resposta
        return SimulacaoResponse(
            id=simulacao_id,
            descricao=simulacao.descricao,
            tipo=simulacao.tipo.value,
            resultado=simulacao.resultado,
            data_execucao=simulacao.dataExecucao.isoformat(),
            detalhes={
                "tempo_maximo": request.tempo_maximo,
                "massa_inicial": request.massa_inicial,
                "massa_combustivel": request.massa_combustivel,
                "empuxo": request.empuxo
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na simulação: {str(e)}")

@app.get("/simulacoes/{simulacao_id}", response_model=SimulacaoResponse)
def obter_simulacao(simulacao_id: str):
    """Obtém os detalhes de uma simulação específica"""
    if simulacao_id not in simulacoes:
        raise HTTPException(status_code=404, detail="Simulação não encontrada")
    
    simulacao = simulacoes[simulacao_id]
    
    return SimulacaoResponse(
        id=simulacao_id,
        descricao=simulacao.descricao,
        tipo=simulacao.tipo.value,
        resultado=simulacao.resultado,
        data_execucao=simulacao.dataExecucao.isoformat(),
        detalhes={}
    )

@app.post("/emergencias", response_model=EmergenciaResponse)
def registrar_emergencia(request: EmergenciaRequest):
    """Registra um evento de emergência e ativa protocolos"""
    try:
        # Criar evento de emergência
        evento = EventoEmergencia(request.descricao)
        
        # Registrar evento com o nível de gravidade
        evento.RegistrarEventoEmergencia(request.gravidade)
        
        # Ativar protocolos (após detecção do evento, conforme diagrama)
        protocolos_ativados = []
        for protocolo in evento.protocolos:
            if not evento.resolvido:
                mensagem = protocolo.ativarProtocolo()
                protocolos_ativados.append({
                    "nome": protocolo.nome,
                    "nivel_gravidade": protocolo.nivelGravidade.value,
                    "descricao": protocolo.descricao,
                    "ativo": protocolo.ativo
                })
        
        # Armazenar evento
        evento_id = f"emerg_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        eventos_emergencia[evento_id] = evento
        
        return EmergenciaResponse(
            evento_id=evento_id,
            descricao=evento.descricao,
            data_deteccao=evento.dataDeteccao.isoformat(),
            resolvido=evento.resolvido,
            protocolos_ativados=protocolos_ativados
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no registro de emergência: {str(e)}")

@app.get("/emergencias/{evento_id}", response_model=EmergenciaResponse)
def obter_emergencia(evento_id: str):
    """Obtém os detalhes de um evento de emergência específico"""
    if evento_id not in eventos_emergencia:
        raise HTTPException(status_code=404, detail="Evento de emergência não encontrado")
    
    evento = eventos_emergencia[evento_id]
    
    protocolos_ativados = []
    for protocolo in evento.protocolos:
        protocolos_ativados.append({
            "nome": protocolo.nome,
            "nivel_gravidade": protocolo.nivelGravidade.value,
            "descricao": protocolo.descricao,
            "ativo": protocolo.ativo
        })
    
    return EmergenciaResponse(
        evento_id=evento_id,
        descricao=evento.descricao,
        data_deteccao=evento.dataDeteccao.isoformat(),
        resolvido=evento.resolvido,
        protocolos_ativados=protocolos_ativados
    )

@app.get("/simulacoes")
def listar_simulacoes():
    """Lista todas as simulações realizadas"""
    return {
        "simulacoes": [
            {
                "id": sim_id,
                "descricao": sim.descricao,
                "tipo": sim.tipo.value,
                "data_execucao": sim.dataExecucao.isoformat()
            }
            for sim_id, sim in simulacoes.items()
        ]
    }

@app.get("/emergencias")
def listar_emergencias():
    """Lista todos os eventos de emergência registrados"""
    return {
        "emergencias": [
            {
                "id": emerg_id,
                "descricao": emerg.descricao,
                "data_deteccao": emerg.dataDeteccao.isoformat(),
                "resolvido": emerg.resolvido,
                "num_protocolos": len(emerg.protocolos)
            }
            for emerg_id, emerg in eventos_emergencia.items()
        ]
    }

@app.post("/simulacoes/{simulacao_id}/graficos")
def gerar_graficos_simulacao(simulacao_id: str):
    """Gera gráficos para uma simulação específica"""
    if simulacao_id not in simulacoes:
        raise HTTPException(status_code=404, detail="Simulação não encontrada")
    
    simulacao = simulacoes[simulacao_id]
    
    if isinstance(simulacao, RocketSimulation):
        try:
            # Gerar gráficos
            simulacao.plot_results()
            return {"mensagem": "Gráficos gerados com sucesso", "arquivo": "rocket_simulation_detailed.png"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erro ao gerar gráficos: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Geração de gráficos disponível apenas para simulações de foguete")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)