"""
Módulo base para simulações espaciais
"""

# Importações adiadas para evitar circular imports
# As classes serão importadas diretamente dos módulos quando necessário

__all__ = [
    'Simulation',
    'SimulationObserver', 
    'EmergencyObserver',
    'SimulationError',
    'SimulationValidationError',
    'SimulationExecutionError',
    'SimulationConfigurationError'
]

# Função para importação lazy
def __getattr__(name):
    if name == 'Simulation':
        from .simulation import Simulation
        return Simulation
    elif name == 'SimulationObserver':
        from .simulation import SimulationObserver
        return SimulationObserver
    elif name == 'EmergencyObserver':
        from .simulation import EmergencyObserver
        return EmergencyObserver
    elif name == 'SimulationError':
        from .simulation import SimulationError
        return SimulationError
    elif name == 'SimulationValidationError':
        from .simulation import SimulationValidationError
        return SimulationValidationError
    elif name == 'SimulationExecutionError':
        from .simulation import SimulationExecutionError
        return SimulationExecutionError
    elif name == 'SimulationConfigurationError':
        from .simulation import SimulationConfigurationError
        return SimulationConfigurationError
    else:
        raise AttributeError(f"module 'core.base' has no attribute '{name}'")