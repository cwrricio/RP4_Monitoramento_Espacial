from enum import Enum

class TipoSimulacao(Enum):
    FOGUETE = "Lançamento de Foguete"
    ORBITA = "Satélite em Órbita"
    REENTRADA = "Reentrada Atmosférica"

class Gravidade(Enum):
    BAIXA = "Baixa"
    MEDIA = "Média"
    ALTA = "Alta"
    CRITICA = "Crítica"
    
class GravidadeEmergencia(Enum):
    NORMAL = "Normal"
    ALERTA = "Alerta"
    PERIGO = "Perigo"
    CRITICA = "Crítica"