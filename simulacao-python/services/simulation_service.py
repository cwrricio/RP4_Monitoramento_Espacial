# services/simulation_service.py
import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from concurrent.futures import ThreadPoolExecutor

from core.simulations.rocket import RocketSimulation
from core.simulations.orbital import OrbitalSimulation
from core.simulations.reentry import ReentrySimulation
from core.observers.concrete import WebSocketObserver, LoggingObserver, EmergencyProtocolObserver
from core.enums import TipoSimulacao
from services.digital_twin_service import DigitalTwinService

logger = logging.getLogger("simulation_service")

class SimulationService:
    """
    Serviço para gerenciamento e execução de simulações espaciais
    """
    
    def __init__(self):
        self.simulacoes_store: Dict[str, Any] = {}
        self.executor = ThreadPoolExecutor(max_workers=5)
        self.digital_twin_service = DigitalTwinService()
        self._active_observers: Dict[str, List[Any]] = {}
        
        logger.info("SimulationService inicializado")

    async def create_rocket_simulation(
        self,
        sim_id: str,
        descricao: str = "Simulação de Lançamento de Foguete",
        tempo_maximo: int = 600,
        massa_inicial: float = 549000.0,
        massa_combustivel: float = 507000.0,
        empuxo: float = 7607000.0
    ) -> RocketSimulation:
        """
        Cria uma nova simulação de foguete
        """
        try:
            logger.info(f"Criando simulação de foguete: {sim_id}")
            
            sim = RocketSimulation(descricao=descricao)
            
            # Configurar parâmetros
            sim.t_max = tempo_maximo
            sim.m0 = massa_inicial
            sim.m_propellant = massa_combustivel
            sim.thrust = empuxo
            
            # Armazenar simulação
            self.simulacoes_store[sim_id] = sim
            self._active_observers[sim_id] = []
            
            logger.info(f"Simulação de foguete {sim_id} criada com sucesso")
            return sim
            
        except Exception as e:
            logger.error(f"Erro ao criar simulação de foguete {sim_id}: {e}")
            raise

    async def create_orbital_simulation(
        self,
        sim_id: str,
        descricao: str = "Simulação de Satélite em Órbita",
        tempo_maximo: int = 6000,
        altitude_inicial: Optional[float] = None
    ) -> OrbitalSimulation:
        """
        Cria uma nova simulação orbital
        """
        try:
            logger.info(f"Criando simulação orbital: {sim_id}")
            
            sim = OrbitalSimulation(descricao=descricao)
            
            # Configurar parâmetros
            sim.t_max = tempo_maximo
            if altitude_inicial is not None:
                sim.h = altitude_inicial
            
            # Armazenar simulação
            self.simulacoes_store[sim_id] = sim
            self._active_observers[sim_id] = []
            
            logger.info(f"Simulação orbital {sim_id} criada com sucesso")
            return sim
            
        except Exception as e:
            logger.error(f"Erro ao criar simulação orbital {sim_id}: {e}")
            raise

    async def create_reentry_simulation(
        self,
        sim_id: str,
        descricao: str = "Simulação de Reentrada Atmosférica",
        altitude_inicial: Optional[float] = None,
        velocidade_inicial: Optional[float] = None
    ) -> ReentrySimulation:
        """
        Cria uma nova simulação de reentrada
        """
        try:
            logger.info(f"Criando simulação de reentrada: {sim_id}")
            
            sim = ReentrySimulation(descricao=descricao)
            
            # Configurar parâmetros
            if altitude_inicial is not None:
                sim.h0 = altitude_inicial
            if velocidade_inicial is not None:
                sim.v0 = -velocidade_inicial  # Negativo para direção descendente
            
            # Armazenar simulação
            self.simulacoes_store[sim_id] = sim
            self._active_observers[sim_id] = []
            
            logger.info(f"Simulação de reentrada {sim_id} criada com sucesso")
            return sim
            
        except Exception as e:
            logger.error(f"Erro ao criar simulação de reentrada {sim_id}: {e}")
            raise

    async def execute_simulation_with_observers(
        self,
        simulation: Any,
        sim_id: str
    ):
        """
        Executa uma simulação com observadores configurados
        """
        try:
            logger.info(f"Iniciando execução da simulação {sim_id}")
            
            # Configurar observadores
            await self._setup_observers(simulation, sim_id)
            
            # Executar simulação em thread separada
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                self.executor,
                self._execute_simulation_sync,
                simulation
            )
            
            # Processar resultados
            simulation.processarSimulacao()
            
            # Criar animação se suportado
            if hasattr(simulation, 'criar_animacao'):
                await loop.run_in_executor(
                    self.executor,
                    simulation.criar_animacao
                )
            
            # Salvar resultados
            if hasattr(simulation, 'salvar_json'):
                await loop.run_in_executor(
                    self.executor,
                    simulation.salvar_json
                )
            
            logger.info(f"Simulação {sim_id} executada com sucesso")
            
        except Exception as e:
            logger.error(f"Erro na execução da simulação {sim_id}: {e}")
            # Notificar erro via observadores
            if hasattr(simulation, 'notify_emergency'):
                simulation.notify_emergency(
                    "ERRO_EXECUCAO",
                    {
                        'erro': str(e),
                        'simulacao_id': sim_id,
                        'timestamp': datetime.now().isoformat()
                    }
                )

    def _execute_simulation_sync(self, simulation: Any):
        """
        Executa simulação de forma síncrona (para uso com ThreadPoolExecutor)
        """
        try:
            simulation.executarSimulacao()
        except Exception as e:
            logger.error(f"Erro síncrono na execução da simulação: {e}")
            raise

    async def _setup_observers(self, simulation: Any, sim_id: str):
        """
        Configura observadores para uma simulação
        """
        try:
            observers = []
            
            # Observer de WebSocket
            from api.routes.websocket import broadcast_simulation_update
            ws_observer = WebSocketObserver(sim_id)
            simulation.add_simulation_observer(ws_observer)
            simulation.add_emergency_observer(ws_observer)
            observers.append(ws_observer)
            
            # Observer de Logging
            logging_observer = LoggingObserver()
            simulation.add_simulation_observer(logging_observer)
            simulation.add_emergency_observer(logging_observer)
            observers.append(logging_observer)
            
            # Observer de Protocolos de Emergência
            emergency_observer = EmergencyProtocolObserver()
            simulation.add_emergency_observer(emergency_observer)
            observers.append(emergency_observer)
            
            self._active_observers[sim_id] = observers
            logger.info(f"Observadores configurados para simulação {sim_id}")
            
        except Exception as e:
            logger.error(f"Erro ao configurar observadores para {sim_id}: {e}")

    async def get_simulation_status(self, sim_id: str) -> Dict[str, Any]:
        """
        Obtém o status de uma simulação
        """
        if sim_id not in self.simulacoes_store:
            raise ValueError(f"Simulação {sim_id} não encontrada")
        
        simulation = self.simulacoes_store[sim_id]
        
        status = {
            "id": sim_id,
            "descricao": simulation.descricao,
            "tipo": simulation.tipo.value,
            "data_execucao": simulation.dataExecucao.isoformat(),
            "status": "CONCLUIDA" if simulation.resultado else "EM_EXECUCAO",
            "resultado": simulation.resultado or "Execução em andamento..."
        }
        
        # Adicionar métricas específicas baseadas no tipo
        if isinstance(simulation, RocketSimulation):
            status.update({
                "parametros": {
                    "tempo_maximo": simulation.t_max,
                    "massa_inicial": simulation.m0,
                    "massa_combustivel": simulation.m_propellant,
                    "empuxo": simulation.thrust
                }
            })
        elif isinstance(simulation, OrbitalSimulation):
            status.update({
                "parametros": {
                    "altitude_inicial": simulation.h,
                    "tempo_maximo": simulation.t_max
                }
            })
        elif isinstance(simulation, ReentrySimulation):
            status.update({
                "parametros": {
                    "altitude_inicial": simulation.h0,
                    "velocidade_inicial": abs(simulation.v0)
                }
            })
        
        return status

    def get_active_simulations(self) -> List[Dict[str, Any]]:
        """
        Retorna lista de simulações ativas
        """
        active_simulations = []
        
        for sim_id, simulation in self.simulacoes_store.items():
            active_simulations.append({
                "id": sim_id,
                "descricao": simulation.descricao,
                "tipo": simulation.tipo.value,
                "data_execucao": simulation.dataExecucao.isoformat(),
                "status": "CONCLUIDA" if simulation.resultado else "EM_EXECUCAO"
            })
        
        return active_simulations

    async def create_digital_twin_from_simulation(
        self,
        simulacao_id: str,
        base_simulation: Any
    ) -> Any:
        """
        Cria um Digital Twin baseado em uma simulação existente
        """
        try:
            logger.info(f"Criando Digital Twin a partir da simulação {simulacao_id}")
            
            # Criar Digital Twin usando o serviço
            digital_twin = await self.digital_twin_service.create_twin_from_simulation(
                asset_id=f"twin_{simulacao_id}",
                base_simulation=base_simulation,
                simulation_id=simulacao_id
            )
            
            logger.info(f"Digital Twin criado com sucesso: {digital_twin.id}")
            return digital_twin
            
        except Exception as e:
            logger.error(f"Erro ao criar Digital Twin a partir de {simulacao_id}: {e}")
            raise

    async def pause_simulation(self, sim_id: str) -> bool:
        """
        Pausa uma simulação em execução
        """
        # Implementação simplificada - em produção seria mais complexa
        logger.info(f"Simulação {sim_id} pausada (implementação simplificada)")
        return True

    async def resume_simulation(self, sim_id: str) -> bool:
        """
        Retoma uma simulação pausada
        """
        # Implementação simplificada - em produção seria mais complexa
        logger.info(f"Simulação {sim_id} retomada (implementação simplificada)")
        return True

    async def stop_simulation(self, sim_id: str) -> bool:
        """
        Para uma simulação em execução
        """
        try:
            if sim_id in self.simulacoes_store:
                # Em uma implementação real, aqui seria necessário
                # implementar um mecanismo de interrupção segura
                logger.info(f"Simulação {sim_id} interrompida")
                return True
            else:
                raise ValueError(f"Simulação {sim_id} não encontrada")
                
        except Exception as e:
            logger.error(f"Erro ao interromper simulação {sim_id}: {e}")
            return False

    async def export_simulation_data(
        self,
        sim_id: str,
        formato: str = "json",
        incluir_dados_completos: bool = False
    ) -> str:
        """
        Exporta dados de uma simulação
        """
        try:
            if sim_id not in self.simulacoes_store:
                raise ValueError(f"Simulação {sim_id} não encontrada")
            
            simulation = self.simulacoes_store[sim_id]
            
            if formato == "json":
                filename = simulation.salvar_json(
                    simplificado=not incluir_dados_completos
                )
                logger.info(f"Dados da simulação {sim_id} exportados para {filename}")
                return filename
            else:
                raise ValueError(f"Formato {formato} não suportado")
                
        except Exception as e:
            logger.error(f"Erro ao exportar dados da simulação {sim_id}: {e}")
            raise

    async def get_simulation_statistics(self) -> Dict[str, Any]:
        """
        Retorna estatísticas gerais das simulações
        """
        total_simulations = len(self.simulacoes_store)
        completed_simulations = sum(
            1 for sim in self.simulacoes_store.values() 
            if sim.resultado
        )
        
        # Contar por tipo
        type_count = {}
        for simulation in self.simulacoes_store.values():
            sim_type = simulation.tipo.value
            type_count[sim_type] = type_count.get(sim_type, 0) + 1
        
        return {
            "total_simulacoes": total_simulations,
            "concluidas": completed_simulations,
            "em_execucao": total_simulations - completed_simulations,
            "distribuicao_tipos": type_count,
            "timestamp": datetime.now().isoformat()
        }

    async def validate_simulation_parameters(
        self,
        simulation_type: TipoSimulacao,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Valida parâmetros de simulação antes da execução
        """
        validation_results = {
            "valid": True,
            "errors": [],
            "warnings": []
        }
        
        try:
            if simulation_type == TipoSimulacao.FOGUETE:
                # Validar parâmetros de foguete
                massa_inicial = parameters.get('massa_inicial', 0)
                massa_combustivel = parameters.get('massa_combustivel', 0)
                
                if massa_combustivel > massa_inicial:
                    validation_results["valid"] = False
                    validation_results["errors"].append(
                        "Massa de combustível não pode ser maior que massa inicial"
                    )
                
                if parameters.get('empuxo', 0) <= 0:
                    validation_results["valid"] = False
                    validation_results["errors"].append(
                        "Empuxo deve ser maior que zero"
                    )
                    
            elif simulation_type == TipoSimulacao.ORBITAL:
                # Validar parâmetros orbitais
                altitude = parameters.get('altitude_inicial', 0)
                if altitude < 160000:  # Limite mínimo para órbita estável
                    validation_results["warnings"].append(
                        "Altitude muito baixa para órbita estável"
                    )
                    
            elif simulation_type == TipoSimulacao.REENTRADA:
                # Validar parâmetros de reentrada
                velocidade = parameters.get('velocidade_inicial', 0)
                if velocidade > 12000:  # Velocidade de escape
                    validation_results["warnings"].append(
                        "Velocidade inicial muito alta"
                    )
        
        except Exception as e:
            validation_results["valid"] = False
            validation_results["errors"].append(f"Erro na validação: {str(e)}")
        
        return validation_results

    async def cleanup_old_simulations(self, older_than_hours: int = 24):
        """
        Remove simulações antigas do armazenamento
        """
        try:
            current_time = datetime.now()
            removed_count = 0
            
            simulations_to_remove = []
            
            for sim_id, simulation in self.simulacoes_store.items():
                simulation_age = current_time - simulation.dataExecucao
                if simulation_age.total_seconds() > older_than_hours * 3600:
                    simulations_to_remove.append(sim_id)
            
            for sim_id in simulations_to_remove:
                del self.simulacoes_store[sim_id]
                if sim_id in self._active_observers:
                    del self._active_observers[sim_id]
                removed_count += 1
            
            logger.info(f"Removidas {removed_count} simulações antigas")
            return removed_count
            
        except Exception as e:
            logger.error(f"Erro ao limpar simulações antigas: {e}")
            return 0

    async def batch_export_simulations(
        self,
        simulation_ids: List[str],
        formato: str = "json"
    ) -> Dict[str, Any]:
        """
        Exporta múltiplas simulações em lote
        """
        results = {
            "total": len(simulation_ids),
            "sucessos": 0,
            "falhas": 0,
            "arquivos": [],
            "erros": []
        }
        
        for sim_id in simulation_ids:
            try:
                if sim_id in self.simulacoes_store:
                    filename = await self.export_simulation_data(sim_id, formato)
                    results["sucessos"] += 1
                    results["arquivos"].append({
                        "simulacao_id": sim_id,
                        "arquivo": filename
                    })
                else:
                    results["falhas"] += 1
                    results["erros"].append({
                        "simulacao_id": sim_id,
                        "erro": "Simulação não encontrada"
                    })
            except Exception as e:
                results["falhas"] += 1
                results["erros"].append({
                    "simulacao_id": sim_id,
                    "erro": str(e)
                })
        
        return results

    def __del__(self):
        """
        Destrutor - limpa recursos
        """
        try:
            self.executor.shutdown(wait=False)
            logger.info("SimulationService finalizado")
        except:
            pass

# Instância global do serviço
simulation_service = SimulationService()