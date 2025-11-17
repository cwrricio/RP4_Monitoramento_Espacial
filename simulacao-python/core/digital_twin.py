# core/digital_twin.py
"""
Módulo de Digital Twin para sistemas de simulação.

Inclui:
 - TwinState
 - DigitalTwin (classe base)
 - RocketDigitalTwin
 - OrbitalDigitalTwin
 - TwinManager
"""

import json
import numpy as np
from datetime import datetime
from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
from collections import deque
import threading


# ─────────────────────────────────────────────────────────────
# ESTADO DO DIGITAL TWIN
# ─────────────────────────────────────────────────────────────

class TwinState:
    """Representa o estado atual de um Digital Twin."""

    def __init__(self):
        self.timestamp = datetime.now()
        self.data = {}        # valores físicos
        self.metadata = {}    # informações derivadas
        self.predictions = {} # previsões
        self.anomalies = []   # anomalias identificadas

    def to_dict(self):
        return {
            'timestamp': self.timestamp.isoformat(),
            'data': self.data,
            'metadata': self.metadata,
            'predictions': self.predictions,
            'anomalies': self.anomalies,
        }

    def from_dict(self, data_dict):
        self.timestamp = datetime.fromisoformat(data_dict['timestamp'])
        self.data = data_dict['data']
        self.metadata = data_dict['metadata']
        self.predictions = data_dict.get('predictions', {})
        self.anomalies = data_dict.get('anomalies', [])


# ─────────────────────────────────────────────────────────────
# DIGITAL TWIN BASE
# ─────────────────────────────────────────────────────────────

class DigitalTwin(ABC):
    """Classe base para todos os Digital Twins."""

    def __init__(self, twin_id: str, physical_entity_id: str):
        self.twin_id = twin_id
        self.physical_entity_id = physical_entity_id

        self.current_state = TwinState()
        self.historical_states = deque(maxlen=10000)

        self.is_synchronized = False
        self.last_sync_time = None
        self.sync_lock = threading.Lock()

        # Configurações
        self.max_history_size = 10000
        self.anomaly_threshold = 0.15   # desvio permitido
        self.prediction_window = 60     # segundos de histórico usado

    # ————————————————————————————
    # MÉTODOS ABSTRATOS
    # ————————————————————————————
    @abstractmethod
    def update_from_physical(self, physical_data: Dict[str, Any]):
        pass

    @abstractmethod
    def predict_next_state(self, horizon: float) -> TwinState:
        pass

    @abstractmethod
    def detect_anomalies(self) -> List[Dict[str, Any]]:
        pass

    # ————————————————————————————
    # SINCRONIZAÇÃO
    # ————————————————————————————
    def sync_with_physical(self, physical_data: Dict[str, Any]):
        with self.sync_lock:
            self.update_from_physical(physical_data)
            self.current_state.timestamp = datetime.now()
            self.historical_states.append(self.current_state.to_dict())
            self.last_sync_time = datetime.now()
            self.is_synchronized = True

            anomalies = self.detect_anomalies()
            if anomalies:
                self.current_state.anomalies = anomalies

    # ————————————————————————————
    # HISTÓRICO
    # ————————————————————————————
    def get_state_at_time(self, timestamp: datetime) -> Optional[TwinState]:
        for state_dict in self.historical_states:
            state_time = datetime.fromisoformat(state_dict['timestamp'])
            if abs((state_time - timestamp).total_seconds()) < 1:
                state = TwinState()
                state.from_dict(state_dict)
                return state
        return None

    def get_historical_data(self, parameter: str, time_range: int = None) -> List[float]:
        values = []
        states = list(self.historical_states)

        if time_range:
            cutoff = datetime.now().timestamp() - time_range
            states = [
                s for s in states
                if datetime.fromisoformat(s['timestamp']).timestamp() >= cutoff
            ]

        for st in states:
            if parameter in st['data']:
                values.append(st['data'][parameter])

        return values

    # ————————————————————————————
    # ESTATÍSTICAS
    # ————————————————————————————
    def calculate_statistics(self, parameter: str) -> Dict[str, float]:
        values = self.get_historical_data(parameter)

        if not values:
            return {}

        arr = np.array(values)
        return {
            "mean": float(arr.mean()),
            "std": float(arr.std()),
            "min": float(arr.min()),
            "max": float(arr.max()),
            "current": float(arr[-1]),
        }

    # ————————————————————————————
    # EXPORTAÇÃO
    # ————————————————————————————
    def export_state(self, filepath: str):
        with open(filepath, "w") as f:
            json.dump(self.current_state.to_dict(), f, indent=2)

    def export_history(self, filepath: str):
        with open(filepath, "w") as f:
            json.dump(list(self.historical_states), f, indent=2)


# ─────────────────────────────────────────────────────────────
# DIGITAL TWIN PARA FOGUETES
# ─────────────────────────────────────────────────────────────

class RocketDigitalTwin(DigitalTwin):
    def __init__(self, twin_id: str, physical_entity_id: str):
        super().__init__(twin_id, physical_entity_id)

        self.nominal_parameters = {
            'altitude': {'min': 0, 'max': 200000, 'nominal': 100000},
            'velocity': {'min': 0, 'max': 8000, 'nominal': 4000},
            'acceleration': {'min': 0, 'max': 50, 'nominal': 25},
            'fuel_mass': {'min': 0, 'max': 507000, 'nominal': 253500},
            'thrust': {'min': 0, 'max': 7607000, 'nominal': 7607000},
            'temperature': {'min': -50, 'max': 2000, 'nominal': 500},
        }

    # ————————————————————————————
    def update_from_physical(self, physical_data: Dict[str, Any]):
        self.current_state.data = {
            'altitude': physical_data.get('altitude', 0),
            'velocity': physical_data.get('velocity', 0),
            'acceleration': physical_data.get('acceleration', 0),
            'fuel_mass': physical_data.get('fuel_mass', 0),
            'thrust': physical_data.get('thrust', 0),
            'temperature': physical_data.get('temperature', 300),
            'time': physical_data.get('time', 0),
        }

        self.current_state.metadata = {
            'phase': self._determine_flight_phase(),
            'health_score': self._calculate_health_score(),
            'fuel_percentage': self._calculate_fuel_percentage(physical_data),
        }

    # ————————————————————————————
    def predict_next_state(self, horizon: float = 10.0) -> TwinState:
        predicted = TwinState()
        predicted.timestamp = datetime.now()

        for param in ['altitude', 'velocity', 'fuel_mass']:
            series = self.get_historical_data(param, time_range=60)

            if len(series) < 2:
                predicted.predictions[param] = self.current_state.data.get(param, 0)
                continue

            x = np.arange(len(series))
            y = np.array(series)

            coeffs = np.polyfit(x, y, 1)
            future_steps = int(horizon / 0.1)
            predicted_value = coeffs[0] * (len(x) + future_steps) + coeffs[1]

            predicted.predictions[param] = float(predicted_value)

        return predicted

    # ————————————————————————————
    def detect_anomalies(self) -> List[Dict[str, Any]]:
        anomalies = []

        for param, limits in self.nominal_parameters.items():
            current_value = self.current_state.data.get(param, 0)

            if current_value < limits['min'] or current_value > limits['max']:
                anomalies.append({
                    "type": "OUT_OF_RANGE",
                    "parameter": param,
                    "current_value": current_value,
                    "expected": [limits['min'], limits['max']],
                    "severity": "HIGH",
                })

            deviation = abs(current_value - limits['nominal']) / limits['nominal']
            if deviation > self.anomaly_threshold:
                anomalies.append({
                    "type": "DEVIATION",
                    "parameter": param,
                    "current_value": current_value,
                    "nominal": limits['nominal'],
                    "deviation_percent": deviation * 100,
                    "severity": "MEDIUM" if deviation < 0.3 else "HIGH",
                })

        return anomalies

    # ————————————————————————————
    def _determine_flight_phase(self):
        alt = self.current_state.data.get('altitude', 0)
        vel = self.current_state.data.get('velocity', 0)
        thrust = self.current_state.data.get('thrust', 0)

        if alt < 1000 and vel < 100:
            return "PRE_LAUNCH"
        if thrust > 0 and alt < 50000:
            return "BOOST"
        if thrust == 0 and vel > 0:
            return "COAST"
        if alt > 100000:
            return "ORBIT"
        if vel < 0:
            return "DESCENT"

        return "UNKNOWN"

    # ————————————————————————————
    def _calculate_health_score(self):
        score = 100
        anomalies = self.detect_anomalies()

        for a in anomalies:
            if a['severity'] == "HIGH":
                score -= 20
            else:
                score -= 10

        return max(0, min(100, score))

    def _calculate_fuel_percentage(self, physical_data):
        fuel = physical_data.get("fuel_mass", 0)
        max_fuel = self.nominal_parameters['fuel_mass']['max']
        return (fuel / max_fuel) * 100 if max_fuel else 0


# ─────────────────────────────────────────────────────────────
# DIGITAL TWIN ORBITAL
# ─────────────────────────────────────────────────────────────

class OrbitalDigitalTwin(DigitalTwin):
    def __init__(self, twin_id: str, physical_entity_id: str):
        super().__init__(twin_id, physical_entity_id)

        self.nominal_parameters = {
            'altitude': {'min': 200000, 'max': 400000, 'nominal': 300000},
            'velocity': {'min': 7000, 'max': 8000, 'nominal': 7500},
            'orbital_period': {'min': 5000, 'max': 6000, 'nominal': 5500},
        }

    def update_from_physical(self, physical_data):
        self.current_state.data = {
            'position_x': physical_data.get('position_x', 0),
            'position_y': physical_data.get('position_y', 0),
            'velocity_x': physical_data.get('velocity_x', 0),
            'velocity_y': physical_data.get('velocity_y', 0),
            'altitude': physical_data.get('altitude', 0),
            'velocity': physical_data.get('velocity', 0),
            'time': physical_data.get('time', 0),
        }

        self.current_state.metadata = {
            "orbital_stability": self._calculate_orbital_stability(),
            "health_score": self._calculate_health_score(),
        }

    def predict_next_state(self, horizon: float = 10.0) -> TwinState:
        predicted = TwinState()
        predicted.timestamp = datetime.now()

        x_hist = self.get_historical_data("position_x", time_range=30)
        y_hist = self.get_historical_data("position_y", time_range=30)

        if len(x_hist) > 5:
            radius = np.mean(np.sqrt(np.array(x_hist) ** 2 + np.array(y_hist) ** 2))
            angles = np.arctan2(y_hist, x_hist)
            angular_vel = np.mean(np.diff(angles))

            future_angle = angles[-1] + angular_vel * horizon

            predicted.predictions["position_x"] = radius * np.cos(future_angle)
            predicted.predictions["position_y"] = radius * np.sin(future_angle)

        return predicted

    def detect_anomalies(self):
        anomalies = []
        altitude = self.current_state.data.get('altitude', 0)

        if altitude < 200000:
            anomalies.append({
                "type": "LOW_ORBIT",
                "parameter": "altitude",
                "value": altitude,
                "severity": "HIGH",
            })

        stability = self._calculate_orbital_stability()
        if stability < 0.8:
            anomalies.append({
                "type": "UNSTABLE_ORBIT",
                "parameter": "stability",
                "value": stability,
                "severity": "MEDIUM",
            })

        return anomalies

    def _calculate_orbital_stability(self):
        alt_hist = self.get_historical_data("altitude", time_range=60)
        if len(alt_hist) < 10:
            return 1.0

        variation = np.std(alt_hist) / np.mean(alt_hist)
        return max(0.0, 1.0 - variation * 10)

    def _calculate_health_score(self):
        score = 100
        for a in self.detect_anomalies():
            if a['severity'] == "HIGH":
                score -= 20
            else:
                score -= 10
        return max(0, min(100, score))


# ─────────────────────────────────────────────────────────────
# GERENCIAMENTO DE MULTIPLOS TWIN
# ─────────────────────────────────────────────────────────────

class TwinManager:
    """Gerencia múltiplos Digital Twins."""

    def __init__(self):
        self.twins: Dict[str, DigitalTwin] = {}

    def register_twin(self, twin: DigitalTwin):
        self.twins[twin.twin_id] = twin
        print(f"[DigitalTwin] Registrado: {twin.twin_id}")

    def unregister_twin(self, twin_id: str):
        if twin_id in self.twins:
            del self.twins[twin_id]
            print(f"[DigitalTwin] Removido: {twin_id}")

    def get_twin(self, twin_id: str) -> Optional[DigitalTwin]:
        return self.twins.get(twin_id)

    def get_all_anomalies(self) -> Dict[str, List[Dict[str, Any]]]:
        result = {}
        for twin_id, twin in self.twins.items():
            anomalies = twin.detect_anomalies()
            if anomalies:
                result[twin_id] = anomalies
        return result

    def export_all_states(self, directory: str):
        import os
        os.makedirs(directory, exist_ok=True)

        for twin_id, twin in self.twins.items():
            twin.export_state(f"{directory}/{twin_id}_state.json")
