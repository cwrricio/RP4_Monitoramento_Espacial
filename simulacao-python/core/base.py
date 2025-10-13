# core/base.py
from datetime import date
from abc import ABC, abstractmethod

class Simulacao(ABC):
    def __init__(self, descricao, tipo):
        self.descricao = descricao
        self.tipo = tipo
        self.resultado = ""
        self.dataExecucao = date.today()

    @abstractmethod
    def executarSimulacao(self):
        """Método abstrato para executar a simulação"""
        pass

    def processarSimulacao(self):
        """Método concreto com implementação padrão"""
        try:
            self.resultado = "Simulação processada com sucesso."
            return True
        except Exception as e:
            self.resultado = f"Erro no processamento: {e}"
            return False

    @abstractmethod
    def criar_animacao(self):
        """Método abstrato para criar animação"""
        pass