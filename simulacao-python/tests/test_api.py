from fastapi.testclient import TestClient
from api.api import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "UP"}

def test_simulacao_endpoint():
    response = client.post("/simular")
    assert response.status_code == 200

    data = response.json()

    assert "tempo" in data
    assert "altitude" in data
    assert "velocidade" in data
    assert len(data["tempo"]) > 0
