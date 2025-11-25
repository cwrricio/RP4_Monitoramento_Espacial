from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json
import asyncio
from typing import Dict, Any
from core.foguete import RocketSimulation
from core.orbita import OrbitalSimulation
from core.reentrada import ReentrySimulation
from core.observers import SimulationObserver, EmergencyObserver
from .models import SimulacaoRequest, SimulacaoResponse
from api.twin_api import router as twin_router
from core.twin_integration import enhance_rocket_with_twin
from core.twin_integration import enhance_orbital_with_twin


app = FastAPI(
    title="Sistema de Simulação Espacial com Observer",
    description="API para simulações espaciais com notificações em tempo real",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(twin_router)

# Armazenamento de simulações
simulacoes: Dict[str, Any] = {}

# Gerenciador de conexões WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                self.disconnect(connection)

manager = ConnectionManager()

# Observer para WebSocket
class WebSocketObserver(SimulationObserver, EmergencyObserver):
    def __init__(self, connection_manager: ConnectionManager, sim_id: str):
        self.manager = connection_manager
        self.sim_id = sim_id


    async def on_simulation_update(self, simulation_type, data: Dict[str, Any]):
        # Serializar dados de forma segura
        serializable_data = self._make_serializable(data)
        message = {
            'type': 'simulation_update',
            'simulation_id': self.sim_id,
            'simulation_type': simulation_type.value if hasattr(simulation_type, 'value') else str(simulation_type),
            'data': serializable_data,
            'timestamp': datetime.now().isoformat()
        }
        try:
            print(f"🔄 Enviando atualização WebSocket: {len(self.manager.active_connections)} conexões ativas")
            print(f"📊 Dados: status={data.get('status', 'N/A')}, progresso={data.get('progresso', 'N/A')}")
            await self.manager.broadcast(json.dumps(message))
        except Exception as e:
            print(f"❌ Erro ao enviar atualização WebSocket: {e}")


    async def on_simulation_complete(self, simulation_type, results: Dict[str, Any]):
        # Serializar resultados de forma segura
        serializable_results = self._make_serializable(results)
        message = {
            'type': 'simulation_complete',
            'simulation_id': self.sim_id,
            'simulation_type': simulation_type.value if hasattr(simulation_type, 'value') else str(simulation_type),
            'results': serializable_results,
            'timestamp': datetime.now().isoformat()
        }
        try:
            await self.manager.broadcast(json.dumps(message))
        except Exception as e:
            print(f"Erro ao enviar conclusão WebSocket: {e}")


    async def on_emergency_detected(self, emergency_type: str, simulation_data: Dict[str, Any]):
        # Serializar dados de emergência de forma segura
        serializable_data = self._make_serializable(simulation_data)
        message = {
            'type': 'emergency',
            'simulation_id': self.sim_id,
            'emergency_type': emergency_type,
            'data': serializable_data,
            'timestamp': datetime.now().isoformat()
        }
        try:
            await self.manager.broadcast(json.dumps(message))
        except Exception as e:
            print(f"Erro ao enviar emergência WebSocket: {e}")
    
    def _make_serializable(self, obj):
        """Converte objetos para formatos serializáveis em JSON"""
        if isinstance(obj, dict):
            return {k: self._make_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._make_serializable(item) for item in obj]
        elif hasattr(obj, 'value'):  # Enums
            return obj.value
        elif hasattr(obj, '__dict__'):  # Objetos customizados
            return str(obj)
        elif isinstance(obj, (int, float, str, bool)) or obj is None:
            return obj
        else:
            return str(obj)


# Endpoints da API
@app.post("/simulacoes/foguete", response_model=SimulacaoResponse)
async def criar_simulacao_foguete(request: SimulacaoRequest):
    """Cria e executa uma simulação de foguete"""
    try:
        sim_id = f"foguete_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
       
        # Criar simulação
        sim = RocketSimulation()
        sim = enhance_rocket_with_twin(sim)
        
        # Configurar parâmetros personalizados se fornecidos
        if hasattr(request, 'tempo_maximo') and request.tempo_maximo:
            sim.t_max = request.tempo_maximo
        if hasattr(request, 'massa_inicial') and request.massa_inicial:
            sim.m0 = request.massa_inicial
        if hasattr(request, 'massa_combustivel') and request.massa_combustivel:
            sim.m_propellant = request.massa_combustivel
        if hasattr(request, 'empuxo') and request.empuxo:
            sim.thrust = request.empuxo
       
        # Criar e registrar observer WebSocket
        ws_observer = WebSocketObserver(manager, sim_id)
        sim.add_simulation_observer(ws_observer)
        sim.add_emergency_observer(ws_observer)
       
        # Executar simulação (assíncrona)
        await asyncio.get_event_loop().run_in_executor(None, sim.executarSimulacao)
       
        # Armazenar simulação
        simulacoes[sim_id] = sim


        return SimulacaoResponse(
            id=sim_id,
            descricao=sim.descricao,
            tipo=sim.tipo.value,
            resultado=sim.resultado,
            data_execucao=sim.dataExecucao.isoformat(),
            detalhes={
                'tempo_maximo': sim.t_max,
                'massa_inicial': sim.m0,
                'massa_combustivel': sim.m_propellant,
                'empuxo': sim.thrust
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/simulacoes/orbita", response_model=SimulacaoResponse)
async def criar_simulacao_orbita(request: SimulacaoRequest):
    """Cria e executa uma simulação orbital"""
    try:
        sim_id = f"orbita_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
       
        # Criar simulação
        sim = OrbitalSimulation()
        sim = enhance_orbital_with_twin(sim)
        # Configurar parâmetros personalizados se fornecidos
        if hasattr(request, 'altitude_inicial') and request.altitude_inicial:
            sim.h = request.altitude_inicial
        if hasattr(request, 'tempo_maximo') and request.tempo_maximo:
            sim.t_max = request.tempo_maximo
       
        # Criar e registrar observer WebSocket
        ws_observer = WebSocketObserver(manager, sim_id)
        sim.add_simulation_observer(ws_observer)
        sim.add_emergency_observer(ws_observer)
       
        # Executar simulação (assíncrona)
        await asyncio.get_event_loop().run_in_executor(None, sim.executarSimulacao)
       
        # Armazenar simulação
        simulacoes[sim_id] = sim


        return SimulacaoResponse(
            id=sim_id,
            descricao=sim.descricao,
            tipo=sim.tipo.value,
            resultado=sim.resultado,
            data_execucao=sim.dataExecucao.isoformat(),
            detalhes={
                'altitude_inicial': sim.h,
                'tempo_maximo': sim.t_max
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/simulacoes/reentrada", response_model=SimulacaoResponse)
async def criar_simulacao_reentrada(request: SimulacaoRequest):
    """Cria e executa uma simulação de reentrada"""
    try:
        sim_id = f"reentrada_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
       
        # Criar simulação
        sim = ReentrySimulation()
       
        # Configurar parâmetros personalizados se fornecidos
        if hasattr(request, 'altitude_inicial') and request.altitude_inicial:
            sim.h0 = request.altitude_inicial
        if hasattr(request, 'velocidade_inicial') and request.velocidade_inicial:
            sim.v0 = -request.velocidade_inicial  # Negativo para direção descendente
       
        # Criar e registrar observer WebSocket
        ws_observer = WebSocketObserver(manager, sim_id)
        sim.add_simulation_observer(ws_observer)
        sim.add_emergency_observer(ws_observer)
       
        # Executar simulação (assíncrona)
        await asyncio.get_event_loop().run_in_executor(None, sim.executarSimulacao)
       
        # Armazenar simulação
        simulacoes[sim_id] = sim


        return SimulacaoResponse(
            id=sim_id,
            descricao=sim.descricao,
            tipo=sim.tipo.value,
            resultado=sim.resultado,
            data_execucao=sim.dataExecucao.isoformat(),
            detalhes={
                'altitude_inicial': sim.h0,
                'velocidade_inicial': abs(sim.v0)
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/simulacoes/{simulacao_id}")
def obter_simulacao(simulacao_id: str):
    """Obtém os resultados de uma simulação específica"""
    if simulacao_id not in simulacoes:
        raise HTTPException(status_code=404, detail="Simulação não encontrada")
   
    sim = simulacoes[simulacao_id]
    return {
        'id': simulacao_id,
        'descricao': sim.descricao,
        'tipo': sim.tipo.value,
        'resultado': sim.resultado,
        'data_execucao': sim.dataExecucao.isoformat(),
        'dados': sim.obter_dados_simulacao()
    }


@app.get("/simulacoes")
def listar_simulacoes():
    """Lista todas as simulações executadas"""
    return {
        'total': len(simulacoes),
        'simulacoes': [
            {
                'id': sim_id,
                'descricao': sim.descricao,
                'tipo': sim.tipo.value,
                'data_execucao': sim.dataExecucao.isoformat()
            }
            for sim_id, sim in simulacoes.items()
        ]
    }


@app.delete("/simulacoes/{simulacao_id}")
def deletar_simulacao(simulacao_id: str):
    """Remove uma simulação do armazenamento"""
    if simulacao_id not in simulacoes:
        raise HTTPException(status_code=404, detail="Simulação não encontrada")
   
    del simulacoes[simulacao_id]
    return {"message": f"Simulação {simulacao_id} removida"}


# WebSocket para notificações em tempo real
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Manter conexão aberta - cliente pode enviar mensagens se necessário
            data = await websocket.receive_text()
            # Echo opcional - pode ser usado para comandos
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Health check
@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Sistema de Simulação Espacial",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "simulacoes_ativas": len(simulacoes)
    }


@app.get("/health")
def health():
    return {"status": "healthy"}