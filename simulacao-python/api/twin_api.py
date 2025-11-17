# twin_api.py
"""
API de Digital Twin integrada ao FastAPI
Permite consultar:
 - estado atual
 - histórico
 - anomalias
 - predições
 - lista de twins
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
from datetime import datetime

from core.digital_twin import TwinManager, DigitalTwin

# Reutilizamos o mesmo gerenciador de Digital Twins em toda a API
twin_manager = TwinManager()

router = APIRouter(
    prefix="/twin",
    tags=["Digital Twin"],
    responses={404: {"description": "Twin não encontrado"}}
)

# ─────────────────────────────────────────────────────────────
# UTILITÁRIOS
# ─────────────────────────────────────────────────────────────

def get_twin_or_404(twin_id: str) -> DigitalTwin:
    twin = twin_manager.get_twin(twin_id)
    if twin is None:
        raise HTTPException(status_code=404, detail="Digital Twin não encontrado")
    return twin

# ─────────────────────────────────────────────────────────────
# ENDPOINTS DE LISTAGEM
# ─────────────────────────────────────────────────────────────

@router.get("/", summary="Lista todos os Digital Twins")
def listar_twins():
    return {
        "total": len(twin_manager.twins),
        "twins": list(twin_manager.twins.keys())
    }

# ─────────────────────────────────────────────────────────────
# ESTADO ATUAL
# ─────────────────────────────────────────────────────────────

@router.get("/{twin_id}", summary="Estado atual do Digital Twin")
def obter_estado_atual(twin_id: str):
    twin = get_twin_or_404(twin_id)
    return {
        "twin_id": twin_id,
        "timestamp": twin.current_state.timestamp.isoformat(),
        "state": twin.current_state.to_dict()
    }

# ─────────────────────────────────────────────────────────────
# HISTÓRICO
# ─────────────────────────────────────────────────────────────

@router.get("/{twin_id}/history", summary="Histórico completo do Digital Twin")
def obter_historico(twin_id: str):
    twin = get_twin_or_404(twin_id)
    return {
        "twin_id": twin_id,
        "history_size": len(twin.historical_states),
        "history": list(twin.historical_states)
    }

@router.get("/{twin_id}/history/at", summary="Estado por timestamp")
def obter_estado_por_tempo(
    twin_id: str,
    timestamp: str = Query(..., description="Timestamp ISO (ex: 2025-01-01T12:00:00)")
):
    twin = get_twin_or_404(twin_id)
    try:
        ts = datetime.fromisoformat(timestamp)
    except:
        raise HTTPException(status_code=400, detail="Formato de timestamp inválido")
    
    state = twin.get_state_at_time(ts)
    if state is None:
        raise HTTPException(status_code=404, detail="Nenhum estado encontrado próximo a esse horário")
    
    return {
        "twin_id": twin_id,
        "state": state.to_dict()
    }

# ─────────────────────────────────────────────────────────────
# ANOMALIAS
# ─────────────────────────────────────────────────────────────

@router.get("/{twin_id}/anomalies", summary="Anomalias do Digital Twin")
def obter_anomalias(twin_id: str):
    twin = get_twin_or_404(twin_id)
    anomalies = twin.detect_anomalies()
    return {
        "twin_id": twin_id,
        "anomaly_count": len(anomalies),
        "anomalies": anomalies
    }

@router.get("/anomalies", summary="Anomalias de todos os Digital Twins")
def obter_todas_anomalias():
    return twin_manager.get_all_anomalies()

# ─────────────────────────────────────────────────────────────
# PREVISÕES
# ─────────────────────────────────────────────────────────────

@router.get("/{twin_id}/predict", summary="Previsão de estado futuro")
def prever_estado_futuro(
    twin_id: str,
    horizon: float = Query(10.0, description="Horizonte de previsão em segundos")
):
    twin = get_twin_or_404(twin_id)
    pred = twin.predict_next_state(horizon)
    return {
        "twin_id": twin_id,
        "horizon_seconds": horizon,
        "predicted_state": pred.predictions
    }

# ─────────────────────────────────────────────────────────────
# ESTATÍSTICAS
# ─────────────────────────────────────────────────────────────

@router.get("/{twin_id}/stats/{parameter}", summary="Estatísticas de um parâmetro")
def obter_estatisticas_parametro(twin_id: str, parameter: str):
    twin = get_twin_or_404(twin_id)
    stats = twin.calculate_statistics(parameter)
    if not stats:
        raise HTTPException(status_code=404, detail="Parâmetro sem histórico")
    
    return {
        "twin_id": twin_id,
        "parameter": parameter,
        "statistics": stats
    }

# ─────────────────────────────────────────────────────────────
# EXPORTAÇÃO
# ─────────────────────────────────────────────────────────────

@router.get("/{twin_id}/export/state", summary="Exporta estado atual para JSON")
def exportar_estado(twin_id: str):
    twin = get_twin_or_404(twin_id)
    filepath = f"{twin_id}_state.json"
    twin.export_state(filepath)
    
    return {
        "message": "Estado exportado com sucesso",
        "file": filepath
    }


@router.get("/{twin_id}/export/history", summary="Exporta histórico completo para JSON")
def exportar_historico(twin_id: str):
    twin = get_twin_or_404(twin_id)
    filepath = f"{twin_id}_history.json"
    twin.export_history(filepath)
    
    return {
        "message": "Histórico exportado com sucesso",
        "file": filepath
    }

