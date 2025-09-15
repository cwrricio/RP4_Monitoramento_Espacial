import numpy as np
from core.main import RocketSimulation
import os
import json

def test_simulation_output():
    sim = RocketSimulation()
    t, y, v = sim.simulate()

    assert len(t) == len(y) == len(v)
    assert np.all(y >= 0)  # Altitude nunca negativa
    assert isinstance(t[0], (int, float))

def test_save_results_to_json(tmp_path):
    sim = RocketSimulation()
    t = np.array([0, 1, 2])
    y = np.array([0, 10, 20])
    v = np.array([0, 5, 10])

    file_path = tmp_path / "resultado_simulacao.json"
    sim.save_results_to_json(t, y, v, filename=file_path)

    assert os.path.exists(file_path)
    with open(file_path) as f:
        data = json.load(f)
    
    assert "tempo" in data
    assert data["tempo"] == [0, 1, 2]
