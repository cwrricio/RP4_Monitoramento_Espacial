from fastapi import FastAPI, HTTPException
from datetime import datetime
from core.foguete import RocketSimulation
from .models import SimulacaoRequest, SimulacaoResponse

app = FastAPI(title="Sistema de Simulação Espacial", version="1.0.0")

simulacoes = {}

@app.post("/simulacoes", response_model=SimulacaoResponse)
def criar_simulacao(request: SimulacaoRequest):
    try:
        sim = RocketSimulation()
        sim.t_max = request.tempo_maximo
        sim.m0 = request.massa_inicial
        sim.m_propellant = request.massa_combustivel
        sim.thrust = request.empuxo
        sim.executarSimulacao()
        sim.processarSimulacao()

        sim_id = f"sim_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        simulacoes[sim_id] = sim

        return SimulacaoResponse(
            id=sim_id,
            descricao=sim.descricao,
            tipo=sim.tipo.value,
            resultado=sim.resultado,
            data_execucao=sim.dataExecucao.isoformat(),
            detalhes={"tempo_maximo": request.tempo_maximo}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
