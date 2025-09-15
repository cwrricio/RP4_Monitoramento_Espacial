from fastapi import FastAPI
from pydantic import BaseModel
from core.main import RocketSimulation

app = FastAPI()

class SimulacaoRequest(BaseModel):
    tempo_maximo: int = 600
    massa_inicial: float = 549000
    massa_combustivel: float = 507000
    empuxo: float = 7607000

@app.post("/simular")
def simular_foguete(request: SimulacaoRequest):
    simulator = RocketSimulation()

    # Permitir customização
    simulator.t_max = request.tempo_maximo
    simulator.m0 = request.massa_inicial
    simulator.m_propellant = request.massa_combustivel
    simulator.thrust = request.empuxo

    # Executar simulação
    t, y, v = simulator.simulate()

    # Encontrar eventos importantes
    burnout_index = (t >= simulator.burn_time).nonzero()[0][0]
    apogee_index = y.argmax()

    return {
        "tempo_queima": simulator.burn_time,
        "altitude_final_km": float(y[burnout_index] / 1000),
        "velocidade_final_km_s": float(v[burnout_index] / 1000),
        "apogeu_km": float(y[apogee_index] / 1000),
        "tempo_apogeu_s": float(t[apogee_index])
    }
