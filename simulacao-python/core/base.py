# core/base.py
import json
import os
from datetime import datetime
from abc import ABC, abstractmethod
import numpy as np 

class Simulacao(ABC):
    def __init__(self, descricao, tipo):
        self.descricao = descricao
        self.tipo = tipo
        self.resultado = ""
        self.dataExecucao = datetime.now()

    @abstractmethod
    def executarSimulacao(self):
        pass

    def processarSimulacao(self):
        try:
            self.resultado = "Simulação processada com sucesso."
            return True
        except Exception as e:
            self.resultado = f"Erro no processamento: {e}"
            return False

    @abstractmethod
    def criar_animacao(self):
        pass

    def salvar_json(self, filename=None, diretorio=None, simplificado=True):
        """Salva os dados da simulação em formato JSON"""
        if filename is None:
            filename = f"{self.tipo.value}_{self.dataExecucao.strftime('%Y-%m-%d_%H-%M-%S')}.json"
        
        if diretorio:
            filename = os.path.join(diretorio, filename)
        
        if simplificado:
            dados = self._obter_dados_simplificados()
        else:
            dados = self._obter_dados_completos()
        
        if diretorio:
            os.makedirs(diretorio, exist_ok=True)
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(dados, f, indent=2, ensure_ascii=False, default=self._json_serializer)
            
            print(f"Dados salvos em: {filename}")
            return filename
        except Exception as e:
            print(f"Erro ao salvar JSON: {e}")
            return None

    def _obter_dados_simplificados(self):
        """Retorna apenas os dados essenciais"""
        return {
            'metadata': {
                'tipo': self.tipo.value,
                'descricao': self.descricao,
                'data_execucao': self.dataExecucao.strftime('%Y-%m-%d %H:%M:%S'),
                'classe': self.__class__.__name__
            },
            'parametros_principais': self._obter_parametros_principais(),
            'resultados_resumidos': self._obter_resultados_resumidos(),
            'estatisticas': self._obter_estatisticas_simplificadas()
        }

    def _obter_dados_completos(self):
        """Retorna todos os dados (versão original)"""
        return {
            'metadata': {
                'tipo': self.tipo.value,
                'descricao': self.descricao,
                'data_execucao': self.dataExecucao.isoformat(),
                'classe': self.__class__.__name__
            },
            'parametros': self._obter_parametros(),
            'resultados': self._obter_resultados_json(),
            'dados_simulacao': self._obter_dados_simulacao_json()
        }

    def _obter_parametros_principais(self):
        """Apenas parâmetros principais, sem arrays grandes"""
        parametros_simples = {}
        for attr in self.__dict__:
            if not attr.startswith('_') and attr not in ['resultado', 'dataExecucao', 't', 'y', 'v', 'positions', 'velocities', 'altitudes', 'times']:
                valor = getattr(self, attr)
                # Apenas valores simples, não arrays
                if not hasattr(valor, '__len__') or isinstance(valor, (str, int, float)):
                    parametros_simples[attr] = valor
        return parametros_simples

    def _obter_resultados_resumidos(self):
        """Resultados principais sem texto longo"""
        # Extrai apenas números do resultado
        resultados = {}
        
        # Métricas básicas que todas as simulações devem ter
        if hasattr(self, 'y') and self.y is not None:
            resultados['altitude_maxima'] = float(np.max(self.y))
            resultados['tempo_total'] = float(self.t[-1]) if hasattr(self, 't') and self.t is not None else 0
            
        if hasattr(self, 'v') and self.v is not None:
            resultados['velocidade_maxima'] = float(np.max(np.abs(self.v)))
            
        return resultados

    def _obter_estatisticas_simplificadas(self):
        """Estatísticas resumidas dos dados"""
        estatisticas = {}
        
        if hasattr(self, 'y') and self.y is not None:
            estatisticas['altitude'] = {
                'max': float(np.max(self.y)),
                'min': float(np.min(self.y)),
                'media': float(np.mean(self.y)),
                'pontos': len(self.y)
            }
            
        if hasattr(self, 'v') and self.v is not None:
            estatisticas['velocidade'] = {
                'max': float(np.max(np.abs(self.v))),
                'min': float(np.min(np.abs(self.v))),
                'media': float(np.mean(np.abs(self.v)))
            }
            
        return estatisticas

    def _obter_parametros(self):
        """Versão original - todos os parâmetros"""
        parametros = {}
        for attr in self.__dict__:
            if not attr.startswith('_') and attr not in ['resultado', 'dataExecucao']:
                valor = getattr(self, attr)
                if hasattr(valor, 'tolist'):
                    parametros[attr] = valor.tolist()
                else:
                    parametros[attr] = valor
        return parametros

    def _obter_resultados_json(self):
        """Versão original"""
        return {'texto': self.resultado}

    def _obter_dados_simulacao_json(self):
        """Versão original"""
        dados = {}
        
        if hasattr(self, 't') and self.t is not None:
            dados['tempo'] = self._converter_para_lista(self.t)
        
        if hasattr(self, 'y') and self.y is not None:
            dados['altitude'] = self._converter_para_lista(self.y)
        
        if hasattr(self, 'v') and self.v is not None:
            dados['velocidade'] = self._converter_para_lista(self.v)
        
        if hasattr(self, 'positions') and self.positions is not None:
            dados['posicoes'] = {
                'x': self._converter_para_lista(self.positions[:, 0]),
                'y': self._converter_para_lista(self.positions[:, 1])
            }
        
        if hasattr(self, 'velocities') and self.velocities is not None:
            dados['velocidades'] = {
                'vx': self._converter_para_lista(self.velocities[:, 0]),
                'vy': self._converter_para_lista(self.velocities[:, 1])
            }
        
        if hasattr(self, 'altitudes') and self.altitudes is not None:
            dados['altitudes'] = self._converter_para_lista(self.altitudes)
        
        if hasattr(self, 'times') and self.times is not None:
            dados['tempos'] = self._converter_para_lista(self.times)
        
        return dados

    def _converter_para_lista(self, dado):
        if hasattr(dado, 'tolist'):
            return dado.tolist()
        elif isinstance(dado, (list, tuple)):
            return list(dado)
        else:
            return dado

    def _json_serializer(self, obj):
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        elif hasattr(obj, 'tolist'):
            return obj.tolist()
        else:
            return str(obj)

    def obter_dados_simulacao(self):
        return {
            'metadata': {
                'tipo': self.tipo.value,
                'descricao': self.descricao,
                'data_execucao': self.dataExecucao.strftime('%Y-%m-%d %H:%M:%S')
            },
            'resultados': self.resultado,
            'dados': self._obter_estatisticas_simplificadas()
        }