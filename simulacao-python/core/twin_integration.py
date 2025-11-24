# core/twin_integration.py
"""
Integração do Digital Twin com as simulações existentes.

Inclui:
 - SimulationTwinAdapter
 - enhance_rocket_with_twin
 - enhance_orbital_with_twin
"""

from datetime import datetime
from typing import Dict, Any

from core.digital_twin import (
    RocketDigitalTwin,
    OrbitalDigitalTwin,
    TwinManager,
)

# Gerenciador global compartilhado
twin_manager = TwinManager()




class SimulationTwinAdapter:
    """
    Adapta uma simulação para alimentar um Digital Twin.
    Sincroniza a cada X passos.
    """

    def __init__(self, simulation, twin):
        self.simulation = simulation
        self.twin = twin
        self.sync_frequency = 10   # sincronizar a cada 10 passos
        self.step_count = 0

    def on_simulation_step(self, step_data: Dict[str, Any]):
        self.step_count += 1
        if self.step_count % self.sync_frequency == 0:
            self.twin.sync_with_physical(step_data)

    def on_simulation_complete(self):
        anomalies = self.twin.detect_anomalies()
        if anomalies:
            print(f"\n[DigitalTwin] ⚠ Anomalias detectadas: {len(anomalies)}")
            for a in anomalies:
                print(f" - {a['type']} ({a['parameter']})")


# ─────────────────────────────────────────────────────────────
# MELHORIA DE RocketSimulation COM DIGITAL TWIN
# ─────────────────────────────────────────────────────────────

def enhance_rocket_with_twin(rocket_sim):
    """
    Adiciona capacidades de Digital Twin ao RocketSimulation.
    Substitui executarSimulacao por uma versão estendida.
    """

    twin_id = f"rocket_twin_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    twin = RocketDigitalTwin(twin_id, "rocket_physical")

    adapter = SimulationTwinAdapter(rocket_sim, twin)

    # Registrar twin globalmente
    twin_manager.register_twin(twin)

    rocket_sim.digital_twin = twin
    rocket_sim.twin_adapter = adapter

    original_execute = rocket_sim.executarSimulacao

    def enhanced_execute():
        print(f"[DigitalTwin] Integrado → {twin_id}")

        result = original_execute()

        # Sincronizar dados históricos
        if rocket_sim.t is not None:
            for i in range(0, len(rocket_sim.t), 5):
                step = {
                    'altitude': float(rocket_sim.y[i]),
                    'velocity': float(rocket_sim.v[i]),
                    'time': float(rocket_sim.t[i]),
                    'fuel_mass': float(rocket_sim.mass(rocket_sim.t[i])),
                    'thrust': float(rocket_sim.thrust_force(rocket_sim.t[i])),
                    'acceleration': 0.0,
                    'temperature': 300 + float(rocket_sim.v[i]) * 0.1,
                }
                adapter.on_simulation_step(step)

        adapter.on_simulation_complete()
        return result

    rocket_sim.executarSimulacao = enhanced_execute
    return rocket_sim



# MELHORIA DE OrbitalSimulation COM DIGITAL TWIN


def enhance_orbital_with_twin(orbital_sim):
    twin_id = f"orbital_twin_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    twin = OrbitalDigitalTwin(twin_id, "satellite_physical")

    adapter = SimulationTwinAdapter(orbital_sim, twin)

    twin_manager.register_twin(twin)

    orbital_sim.digital_twin = twin
    orbital_sim.twin_adapter = adapter

    original_execute = orbital_sim.executarSimulacao

    def enhanced_execute():
        print(f"[DigitalTwin] Integrado → {twin_id}")

        result = original_execute()

        if orbital_sim.positions is not None:
            for i in range(0, len(orbital_sim.times), 5):
                step = {
                    'position_x': float(orbital_sim.positions[i][0]),
                    'position_y': float(orbital_sim.positions[i][1]),
                    'velocity_x': float(orbital_sim.velocities[i][0]),
                    'velocity_y': float(orbital_sim.velocities[i][1]),
                    'altitude': float(orbital_sim.altitudes[i]),
                    'velocity': float((orbital_sim.velocities[i]**2).sum() ** 0.5),
                    'time': float(orbital_sim.times[i]),
                }
                adapter.on_simulation_step(step)

        adapter.on_simulation_complete()
        return result

    orbital_sim.executarSimulacao = enhanced_execute
    return orbital_sim
