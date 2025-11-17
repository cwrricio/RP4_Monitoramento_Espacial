# core/observers.py
from abc import ABC, abstractmethod
from typing import Dict, Any
from .enums import TipoSimulacao

class SimulationObserver(ABC):
    @abstractmethod
    def on_simulation_update(self, simulation_type: TipoSimulacao, data: Dict[str, Any]):
        """Chamado quando há atualização na simulação"""
        pass  
    @abstractmethod
    def on_simulation_complete(self, simulation_type: TipoSimulacao, results: Dict[str, Any]):
        """Chamado quando a simulação é concluída"""
        pass

class EmergencyObserver(ABC):
    @abstractmethod
    def on_emergency_detected(self, emergency_type: str, simulation_data: Dict[str, Any]):
        """Chamado quando uma emergência é detectada"""
        pass