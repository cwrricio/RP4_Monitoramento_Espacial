# core/reentrada.py
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from matplotlib.patches import Rectangle
from .base import Simulacao
from .enums import TipoSimulacao
from utils.physics import PhysicsUtils
from utils.animation import AnimationUtils


class ReentrySimulation(Simulacao):
    def __init__(self, descricao="Simulação de Reentrada Atmosférica"):
        super().__init__(descricao, TipoSimulacao.REENTRADA)
        self.h0 = 120000  # altitude inicial (m)
        self.v0 = -7500   # velocidade inicial (m/s)
        self.cd = 1.5     # coeficiente de arrasto aumentado
        self.area = 15    # área aumentada
        self.m = 5000     # massa aumentada
       
        # Usar constantes do PhysicsUtils
        self.rho0 = PhysicsUtils.RHO0
        self.H = PhysicsUtils.H_ATMOSPHERE
        self.g = PhysicsUtils.G0
       
        self.dt = 0.1     # passo de tempo


    def executarSimulacao(self):
        print("Executando simulação de reentrada...")
       
        # Notificar início da simulação
        self.notify_simulation_update({
            'status': 'INICIANDO',
            'message': 'Simulação de reentrada iniciada',
            'step': 0,
            'total_steps': 'dinâmico'
        })
       
        y, v = self.h0, self.v0
        ys, vs, ts = [], [], []
        t = 0
        step_count = 0


        while y > 0:
            # Usar PhysicsUtils para cálculos físicos
            rho = PhysicsUtils.densidade_ar(y)
            drag = PhysicsUtils.forca_arrasto(v, rho, self.cd, self.area)
            a = -self.g - drag / self.m
           
            v += a * self.dt
            y += v * self.dt
            t += self.dt
            ys.append(y)
            vs.append(v)
            ts.append(t)
            step_count += 1


            # Notificar progresso a cada 100 passos
            if step_count % 100 == 0:
                # Calcular número Mach e pressão dinâmica
                mach = PhysicsUtils.numero_mach(abs(v), y)
                pressao_dinamica = PhysicsUtils.pressao_dinamica(abs(v), y)
               
                self.notify_simulation_update({
                    'status': 'EXECUTANDO',
                    'step': step_count,
                    'altitude_atual': float(y),
                    'velocidade_atual': float(abs(v)),
                    'tempo_atual': float(t),
                    'aceleracao_atual': float(abs(a)),
                    'numero_mach': float(mach),
                    'pressao_dinamica': float(pressao_dinamica)
                })
               
                # Verificar condições de emergência
                self._verificar_emergencias(step_count, y, v, a, t)


        self.t, self.y, self.v = np.array(ts), np.array(ys), np.array(vs)
       
        # Processa automaticamente após executar
        self.processarSimulacao()
        return self


    def _verificar_emergencias(self, step_count, y, v, a, t):
        """Verifica condições de emergência durante a reentrada usando PhysicsUtils"""
        if not self._emergency_observers:
            return
       
        # Condições de emergência específicas da reentrada
        aceleracao_g = abs(a) / 9.81
       
        if aceleracao_g > 8:  # Desaceleração crítica
            self.notify_emergency("DESACELERACAO_CRITICA", {
                'tempo': float(t),
                'altitude': float(y),
                'velocidade': float(abs(v)),
                'aceleracao_g': float(aceleracao_g),
                'limite_seguro': 6.0,
                'severidade': 'ALTA'
            })
       
        if abs(v) > 5000 and y < 50000:  # Velocidade muito alta em baixa altitude
            self.notify_emergency("VELOCIDADE_ELEVADA", {
                'tempo': float(t),
                'altitude': float(y),
                'velocidade': float(abs(v)),
                'severidade': 'MEDIA'
            })
       
        # Temperatura usando PhysicsUtils
        temperature = PhysicsUtils.temperatura_reatrada(abs(v), y)
       
        if temperature > 2000:  # Temperatura crítica
            self.notify_emergency("SUPERAQUECIMENTO", {
                'tempo': float(t),
                'altitude': float(y),
                'temperatura': float(temperature),
                'limite_seguro': 1500,
                'severidade': 'ALTA'
            })
       
        if y < 10000 and abs(v) > 1000:  # Aproximação final muito rápida
            self.notify_emergency("APROXIMACAO_RAPIDA", {
                'tempo': float(t),
                'altitude': float(y),
                'velocidade': float(abs(v)),
                'severidade': 'CRITICA'
            })


    def processarSimulacao(self):
        """Processa os resultados da simulação de reentrada com PhysicsUtils"""
        try:
            if not hasattr(self, 'y') or not hasattr(self, 'v'):
                self.resultado = "Erro: Simulação não foi executada."
                return False
           
            # Cálculos dos resultados
            accelerations = np.diff(self.v) / self.dt
            max_deceleration = np.max(np.abs(accelerations))
            impact_velocity = self.v[-1] if len(self.v) > 0 else 0
           
            # Temperatura máxima usando PhysicsUtils
            max_temperature = 0
            for i in range(len(self.y)):
                temp = PhysicsUtils.temperatura_reatrada(abs(self.v[i]), self.y[i])
                if temp > max_temperature:
                    max_temperature = temp
           
            # Calcular número Mach máximo
            max_mach = 0
            for i in range(len(self.y)):
                mach = PhysicsUtils.numero_mach(abs(self.v[i]), self.y[i])
                if mach > max_mach:
                    max_mach = mach


            self.resultado = f"""
RESULTADOS DA SIMULAÇÃO DE REENTRADA:
-----------------------------------------
• Tipo: {self.tipo.value}
• Altitude inicial: {self.h0/1000:.2f} km
• Velocidade inicial: {abs(self.v0):.0f} m/s
• Velocidade de impacto: {abs(impact_velocity):.1f} m/s
• Desaceleração máxima: {max_deceleration/9.81:.1f} G
• Temperatura máxima: {max_temperature:.0f} K
• Número Mach máximo: {max_mach:.2f}
• Tempo total: {self.t[-1]:.1f} s
• Data da simulação: {self.dataExecucao}
"""
            # Chamar o processamento da classe base
            return super().processarSimulacao()
           
        except Exception as e:
            self.resultado = f"Erro no processamento: {e}"
            return False


    def criar_animacao(self):
        """Cria animação da reentrada atmosférica usando AnimationUtils"""
        print("Criando animação de reentrada...")
        if self.y is None:
            print("Erro: Execute a simulação primeiro.")
            return
       
        # Notificar início da animação
        self.notify_simulation_update({
            'status': 'ANIMACAO_INICIADA',
            'message': 'Criando animação de reentrada'
        })
       
        # Usar utilitário de animação de reentrada
        ani = AnimationUtils.criar_animacao_reentrada(
            self.y, self.v, self.t, "REENTRADA ATMOSFÉRICA"
        )
       
        # Notificar conclusão da animação
        self.notify_simulation_update({
            'status': 'ANIMACAO_CONCLUIDA',
            'message': 'Animação de reentrada criada com sucesso'
        })
       
        plt.show()
        return ani


    def criar_animacao_detalhada(self):
        """Cria animação detalhada com múltiplos parâmetros"""
        if self.y is None or self.v is None:
            print("Erro: Execute a simulação primeiro.")
            return
       
        print("Criando animação detalhada de reentrada...")
       
        # Notificar início da animação
        self.notify_simulation_update({
            'status': 'ANIMACAO_INICIADA',
            'message': 'Criando animação detalhada de reentrada'
        })
       
        # Calcular parâmetros adicionais
        accelerations = np.diff(self.v) / self.dt
        accelerations_g = np.abs(accelerations) / 9.81
       
        # Calcular temperaturas e números Mach
        temperatures = []
        mach_numbers = []
        for i in range(len(self.y)):
            temp = PhysicsUtils.temperatura_reatrada(abs(self.v[i]), self.y[i])
            mach = PhysicsUtils.numero_mach(abs(self.v[i]), self.y[i])
            temperatures.append(temp)
            mach_numbers.append(mach)
       
        # Criar painel multigráfico
        datasets = [
            self.y,
            np.abs(self.v),
            accelerations_g if len(accelerations_g) > 0 else np.zeros(len(self.t)-1),
            temperatures
        ]
       
        titles = [
            'Altitude vs Tempo',
            'Velocidade vs Tempo',
            'Aceleração vs Tempo (G)',
            'Temperatura vs Tempo (K)'
        ]
       
        ani = AnimationUtils.criar_painel_multigrafico(
            self.t, datasets, titles, layout=(2, 2), figsize=(15, 10)
        )
       
        # Notificar conclusão da animação
        self.notify_simulation_update({
            'status': 'ANIMACAO_CONCLUIDA',
            'message': 'Animação detalhada criada com sucesso'
        })
       
        plt.show()
        return ani


    def criar_animacao_simples(self):
        """Versão simplificada da animação"""
        print("Criando animação simplificada de reentrada...")
        if self.y is None:
            print("Erro: Execute a simulação primeiro.")
            return
       
        # Gráfico estático
        plt.figure(figsize=(10, 8))
        plt.plot(self.t, self.y, 'b-', linewidth=2)
        plt.xlabel('Tempo (s)')
        plt.ylabel('Altitude (m)')
        plt.title('Trajetória de Reentrada')
        plt.grid(True)
        plt.show()
       
        print("Gráfico estático exibido")


    def plotar_dados_completos(self):
        """Plota todos os dados da simulação"""
        if self.y is None:
            return
       
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 10))
       
        # Altitude vs Tempo
        ax1.plot(self.t, self.y, 'b-', linewidth=2)
        ax1.set_xlabel('Tempo (s)')
        ax1.set_ylabel('Altitude (m)')
        ax1.set_title('Altitude vs Tempo')
        ax1.grid(True)
       
        # Velocidade vs Tempo
        ax2.plot(self.t, abs(self.v), 'r-', linewidth=2)
        ax2.set_xlabel('Tempo (s)')
        ax2.set_ylabel('Velocidade (m/s)')
        ax2.set_title('Velocidade vs Tempo')
        ax2.grid(True)
       
        # Aceleração vs Tempo
        acceleration = np.diff(self.v) / self.dt
        ax3.plot(self.t[1:], abs(acceleration) / 9.81, 'g-', linewidth=2)
        ax3.set_xlabel('Tempo (s)')
        ax3.set_ylabel('Aceleração (G)')
        ax3.set_title('Aceleração vs Tempo')
        ax3.grid(True)
       
        # Velocidade vs Altitude
        ax4.plot(self.y, abs(self.v), 'purple', linewidth=2)
        ax4.set_xlabel('Altitude (m)')
        ax4.set_ylabel('Velocidade (m/s)')
        ax4.set_title('Velocidade vs Altitude')
        ax4.grid(True)
       
        plt.tight_layout()
        plt.show()


    def _obter_resultados_json(self):
        """Resultados específicos para reentrada em formato JSON"""
        resultados = super()._obter_resultados_json()
       
        # Adiciona métricas calculadas específicas da reentrada
        if self.y is not None and self.v is not None:
            accelerations = np.diff(self.v) / self.dt
            max_deceleration = np.max(np.abs(accelerations))
            impact_velocity = self.v[-1] if len(self.v) > 0 else 0
           
            # Calcular temperaturas e números Mach
            max_temperature = 0
            max_mach = 0
            for i in range(len(self.y)):
                temp = PhysicsUtils.temperatura_reatrada(abs(self.v[i]), self.y[i])
                mach = PhysicsUtils.numero_mach(abs(self.v[i]), self.y[i])
                if temp > max_temperature:
                    max_temperature = temp
                if mach > max_mach:
                    max_mach = mach
           
            resultados.update({
                'initial_altitude': self.h0,
                'initial_velocity': abs(self.v0),
                'impact_velocity': abs(impact_velocity),
                'max_deceleration_g': float(max_deceleration/9.81),
                'max_temperature': float(max_temperature),
                'max_mach_number': float(max_mach),
                'total_time': float(self.t[-1]),
                'final_altitude': float(self.y[-1])
            })
       
        return resultados