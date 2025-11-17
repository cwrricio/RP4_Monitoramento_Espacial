# services/observers.py
from core.observers import SimulationObserver, EmergencyObserver
from core.enums import TipoSimulacao
from datetime import datetime
from typing import Dict, Any


class LoggingObserver(SimulationObserver, EmergencyObserver):
    def on_simulation_update(self, simulation_type: TipoSimulacao, data: Dict[str, Any]):
        timestamp = datetime.now().strftime('%H:%M:%S')
        status = data.get('status', 'UPDATE')
       
        if status == 'INICIANDO':
            print(f"[{timestamp}] INICIANDO: {simulation_type.value}")
        elif status == 'EXECUTANDO':
            progresso = data.get('progresso', 0)
            altitude = data.get('altitude_atual', 0)
            velocidade = data.get('velocidade_atual', 0)
            print(f"[{timestamp}] {simulation_type.value}: {progresso:.1f}% | Alt: {altitude:.0f}m | Vel: {velocidade:.0f}m/s")
        elif status == 'ANIMACAO_INICIADA':
            print(f"[{timestamp}] INICIANDO ANIMACAO: {simulation_type.value}")
        elif status == 'ANIMACAO_CONCLUIDA':
            print(f"[{timestamp}] ANIMACAO CONCLUIDA: {simulation_type.value}")
       
    def on_simulation_complete(self, simulation_type: TipoSimulacao, results: Dict[str, Any]):
        timestamp = datetime.now().strftime('%H:%M:%S')
        print(f"[{timestamp}] CONCLUIDO: {simulation_type.value}")
       
        # Extrair métricas importantes
        estatisticas = results.get('estatisticas', {})
        if 'altitude' in estatisticas:
            alt = estatisticas['altitude']
            print(f"   Altitude: Max {alt.get('max', 0):.0f}m, Media {alt.get('media', 0):.0f}m")
       
    def on_emergency_detected(self, emergency_type: str, simulation_data: Dict[str, Any]):
        timestamp = datetime.now().strftime('%H:%M:%S')
        print(f"[{timestamp}] EMERGENCIA: {emergency_type}")
        print(f"   Severidade: {simulation_data.get('severidade', 'DESCONHECIDA')}")
       
        if 'altitude' in simulation_data:
            print(f"   Altitude: {simulation_data['altitude']:.0f}m")
        if 'tempo' in simulation_data:
            print(f"   Tempo: {simulation_data['tempo']:.1f}s")


class EmergencyProtocolObserver(EmergencyObserver):
    def on_emergency_detected(self, emergency_type: str, simulation_data: Dict[str, Any]):
        severidade = simulation_data.get('severidade', 'MEDIA')
       
        print(f"SISTEMA DE EMERGENCIA ATIVADO")
        print(f"   Tipo: {emergency_type}")
        print(f"   Severidade: {severidade}")
       
        # Protocolos automáticos baseados no tipo de emergência
        protocolos = {
            # Protocolos de foguete
            "VELOCIDADE_CRITICA": self._protocolo_velocidade_critica,
            "COMBUSTIVEL_CRITICO": self._protocolo_combustivel_critico,
            "FALHA_ORBITAL": self._protocolo_falha_orbital,
            "ERRO_PROCESSAMENTO": self._protocolo_erro_processamento,
           
            # Protocolos orbitais
            "ORBITA_BAIXA": self._protocolo_orbita_baixa,
            "ORBITA_ALTA": self._protocolo_orbita_alta,
            "ORBITA_INSTAVEL": self._protocolo_orbita_instavel,
           
            # Protocolos de reentrada
            "DESACELERACAO_CRITICA": self._protocolo_desaceleracao_critica,
            "VELOCIDADE_ELEVADA": self._protocolo_velocidade_critica,
            "SUPERAQUECIMENTO": self._protocolo_superaquecimento,
            "APROXIMACAO_RAPIDA": self._protocolo_aproximacao_rapida
        }
       
        protocolo = protocolos.get(emergency_type)
        if protocolo:
            protocolo(simulation_data)
        else:
            print(f"   Nenhum protocolo especifico para {emergency_type}")
   
    def _protocolo_velocidade_critica(self, data: Dict[str, Any]):
        print("   PROTOCOLO: Reduzir potencia dos motores em 30%")
        print("   PROTOCOLO: Verificar integridade estrutural")
        print("   PROTOCOLO: Preparar sistema de abortagem")
   
    def _protocolo_combustivel_critico(self, data: Dict[str, Any]):
        percentual = data.get('percentual_combustivel', 0)
        print(f"   PROTOCOLO: Combustivel em {percentual:.1f}%")
        print("   PROTOCOLO: Otimizar queima de combustivel")
        print("   PROTOCOLO: Preparar para abortagem se necessario")
   
    def _protocolo_falha_orbital(self, data: Dict[str, Any]):
        print("   PROTOCOLO: Executar queima de correcao")
        print("   PROTOCOLO: Recalcular trajetoria")
        print("   PROTOCOLO: Ativar sistema de navegacao backup")
   
    def _protocolo_erro_processamento(self, data: Dict[str, Any]):
        print("   PROTOCOLO: Reiniciar sistemas computacionais")
        print("   PROTOCOLO: Ativar sistemas redundantes")
   
    def _protocolo_orbita_baixa(self, data: Dict[str, Any]):
        print("   PROTOCOLO: Executar queima de elevacao orbital")
        print("   PROTOCOLO: Verificar reservas de combustivel")
        print("   PROTOCOLO: Preparar para reentrada controlada se necessario")
   
    def _protocolo_orbita_alta(self, data: Dict[str, Any]):
        print("   PROTOCOLO: Reduzir velocidade orbital")
        print("   PROTOCOLO: Verificar risco de escape gravitacional")
   
    def _protocolo_orbita_instavel(self, data: Dict[str, Any]):
        print("   PROTOCOLO: Executar correcoes orbitais imediatas")
        print("   PROTOCOLO: Ativar sistemas de estabilizacao")
   
    def _protocolo_desaceleracao_critica(self, data: Dict[str, Any]):
        print("   PROTOCOLO: Reduzir angulo de ataque")
        print("   PROTOCOLO: Verificar integridade estrutural")
        print("   PROTOCOLO: Preparar sistemas de sobrevivencia")
   
    def _protocolo_superaquecimento(self, data: Dict[str, Any]):
        print("   PROTOCOLO: Ativar sistemas de refrigeracao")
        print("   PROTOCOLO: Ajustar trajetoria para reduzir atrito")
        print("   PROTOCOLO: Monitorar escudo termico")
   
    def _protocolo_aproximacao_rapida(self, data: Dict[str, Any]):
        print("   PROTOCOLO: Acionar paraquedas de frenagem")
        print("   PROTOCOLO: Preparar para impacto")
        print("   PROTOCOLO: Ativar sistemas de emergencia")