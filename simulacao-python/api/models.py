from pydantic import BaseModel
from enum import Enum

class TipoSimulacao(str, Enum):
    FOGUETE = "Foguete"
    ORBITA = "Órbita"
    REENTRADA = "Reentrada"

class SimulacaoRequest(BaseModel):
    descricao: str = "Simulação de Lançamento de Foguete"
    tempo_maximo: int = 600
    massa_inicial: float = 549000
    massa_combustivel: float = 507000
    empuxo: float = 7607000
    tipo: TipoSimulacao = TipoSimulacao.FOGUETE

class SimulacaoResponse(BaseModel):
    id: str
    descricao: str
    tipo: str
    resultado: str
    data_execucao: str
    detalhes: dict