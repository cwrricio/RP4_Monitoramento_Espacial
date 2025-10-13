import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from matplotlib.patches import Rectangle
from .base import Simulacao
from .enums import TipoSimulacao

class ReentrySimulation(Simulacao):
    def __init__(self, descricao="Simulação de Reentrada Atmosférica"):
        super().__init__(descricao, TipoSimulacao.REENTRADA)
        self.h0 = 120000  # altitude inicial (m)
        self.v0 = -7500   # velocidade inicial (m/s)
        self.cd = 1.5     # coeficiente de arrasto aumentado
        self.area = 15    # área aumentada
        self.m = 5000     # massa aumentada
        self.rho0 = 1.225 # densidade do ar ao nível do mar
        self.H = 8500     # escala de altura atmosférica
        self.g = 9.81     # gravidade
        self.dt = 0.1     # passo de tempo

    def executarSimulacao(self):
        print("Executando simulação de reentrada...")
        y, v = self.h0, self.v0
        ys, vs, ts = [], [], []
        t = 0

        while y > 0:
            rho = self.rho0 * np.exp(-y / self.H)
            drag = 0.5 * rho * self.cd * self.area * v**2 * np.sign(v)
            a = -self.g - drag / self.m
            v += a * self.dt
            y += v * self.dt
            t += self.dt
            ys.append(y)
            vs.append(v)
            ts.append(t)

        self.t, self.y, self.v = np.array(ts), np.array(ys), np.array(vs)
        return self

    def processarSimulacao(self):
        """Processa os resultados da simulação de reentrada"""
        try:
            if not hasattr(self, 'y') or not hasattr(self, 'v'):
                self.resultado = "Erro: Simulação não foi executada."
                return False
            
            # Cálculos dos resultados
            accelerations = np.diff(self.v) / self.dt
            max_deceleration = np.max(np.abs(accelerations))
            impact_velocity = self.v[-1] if len(self.v) > 0 else 0
            
            # Temperatura estimada (simplificada)
            max_heat_flux = np.max(self.v**3 * np.sqrt(self.rho0 * np.exp(-self.y / self.H)))
            max_temperature = 300 + max_heat_flux * 0.1  # Temperatura em Kelvin
            
            self.resultado = f"""
📊 RESULTADOS DA SIMULAÇÃO DE REENTRADA:
-----------------------------------------
• Tipo: {self.tipo.value}
• Altitude inicial: {self.h0/1000:.2f} km
• Velocidade inicial: {abs(self.v0):.0f} m/s
• Velocidade de impacto: {abs(impact_velocity):.1f} m/s
• Desaceleração máxima: {max_deceleration/9.81:.1f} G
• Temperatura máxima: {max_temperature:.0f} K
• Tempo total: {self.t[-1]:.1f} s
• Data da simulação: {self.dataExecucao}
"""
            return True
        except Exception as e:
            self.resultado = f"Erro no processamento: {e}"
            return False

    def criar_animacao(self):
        """Cria animação da reentrada atmosférica - VERSÃO CORRIGIDA"""
        print("Criando animação de reentrada...")
        if self.y is None:
            print("Erro: Execute a simulação primeiro.")
            return
        
        # Limita frames para performance
        total_frames = min(400, len(self.y))
        step = max(1, len(self.y) // total_frames)
        frame_indices = range(0, len(self.y), step)
        
        fig, ax = plt.subplots(figsize=(10, 12))
        
        # Configuração do gráfico
        ax.set_xlim(-2, 2)
        ax.set_ylim(-5000, self.h0 * 1.1)  # Espaço extra para o solo
        ax.set_title("🔥 REENTRADA ATMOSFÉRICA", fontsize=16, fontweight='bold')
        ax.set_xlabel("Direção (m)")
        ax.set_ylabel("Altitude (m)")
        ax.grid(True, alpha=0.3)
        
        # Cores de fundo para atmosfera
        ax.axhspan(80000, self.h0, alpha=0.1, color='black', label='Espaço')
        ax.axhspan(40000, 80000, alpha=0.1, color='darkblue', label='Alta Atmosfera')
        ax.axhspan(10000, 40000, alpha=0.1, color='blue', label='Atmosfera Média')
        ax.axhspan(0, 10000, alpha=0.1, color='lightblue', label='Baixa Atmosfera')
        
        # Solo
        ground = Rectangle((-10, -5000), 20, 5000, color='brown', alpha=0.7, label='Superfície')
        ax.add_patch(ground)
        
        # Cápsula
        capsule, = ax.plot([], [], 'ro', markersize=12, markeredgecolor='darkred', 
                          markerfacecolor='red', label='Cápsula')
        
        # Esteira de plasma
        plasma_trail, = ax.plot([], [], 'y-', linewidth=3, alpha=0.7, label='Esteira de Plasma')
        
        # Trajetória
        trajectory, = ax.plot([], [], 'r--', alpha=0.5, linewidth=1, label='Trajetória')
        
        # Caixa de informações - CANTO SUPERIOR DIREITO
        info_text = ax.text(0.98, 0.98, "", transform=ax.transAxes, fontsize=10,
                          verticalalignment='top', horizontalalignment='right',
                          bbox=dict(boxstyle='round', facecolor='white', alpha=0.9))
        
        ax.legend(loc='upper left')

        def init():
            """Inicializa a animação"""
            capsule.set_data([], [])
            plasma_trail.set_data([], [])
            trajectory.set_data([], [])
            info_text.set_text("")
            return capsule, plasma_trail, trajectory, info_text

        def animate(frame_idx):
            """Atualiza o frame da animação"""
            i = frame_indices[frame_idx] if frame_idx < len(frame_indices) else frame_indices[-1]
            
            current_altitude = self.y[i]
            current_velocity = self.v[i]
            current_time = self.t[i]
            
            # Cápsula (sempre no centro)
            capsule.set_data([0], [current_altitude])
            
            # Esteira de plasma (visível apenas em alta velocidade)
            if abs(current_velocity) > 2000 and current_altitude > 50000:
                trail_length = min(1000, abs(current_velocity) * 0.1)
                plasma_trail.set_data([0, 0], 
                                    [current_altitude, current_altitude + trail_length])
                plasma_trail.set_alpha(0.8)
                plasma_trail.set_color('orange')
            elif abs(current_velocity) > 1000:
                plasma_trail.set_data([0, 0], 
                                    [current_altitude, current_altitude + 500])
                plasma_trail.set_alpha(0.6)
                plasma_trail.set_color('yellow')
            else:
                plasma_trail.set_data([], [])
            
            # Trajetória (últimos 100 pontos)
            start_idx = max(0, i - 100)
            trajectory.set_data(np.zeros(i - start_idx + 1), self.y[start_idx:i+1])
            
            # Informações em tempo real - CANTO SUPERIOR DIREITO
            phase = "🛰️ FASE INICIAL" if current_altitude > 80000 else \
                   "🔥 REENTRADA CRÍTICA" if current_altitude > 40000 else \
                   "🪂 FASE FINAL" if current_altitude > 10000 else "🏁 QUASE TERRA"
            
            # Temperatura estimada
            temp = 300 + (abs(current_velocity)**3 * 1e-9)
            
            info_text.set_text(
                f"⏰ Tempo: {current_time:.1f} s\n"
                f"📍 Altitude: {current_altitude:.0f} m\n"
                f"🚀 Velocidade: {abs(current_velocity):.0f} m/s\n"
                f"🌡️ Temperatura: {temp:.0f} K\n"
                f"📊 Fase: {phase}\n"
                f"🔄 Frame: {frame_idx+1}/{len(frame_indices)}"
            )
            
            return capsule, plasma_trail, trajectory, info_text

        # Cria a animação
        ani = FuncAnimation(
            fig, animate, frames=len(frame_indices),
            init_func=init, interval=30, blit=True, repeat=True
        )
        
        plt.tight_layout()
        plt.show()
        return ani

    def criar_animacao_simples(self):
        """Versão simplificada da animação"""
        print("Criando animação simplificada de reentrada...")
        if self.y is None:
            print("Erro: Execute a simulação primeiro.")
            return
        
        # Gráfico estático para debug
        plt.figure(figsize=(10, 8))
        plt.plot(self.t, self.y, 'b-', linewidth=2)
        plt.xlabel('Tempo (s)')
        plt.ylabel('Altitude (m)')
        plt.title('Trajetória de Reentrada')
        plt.grid(True)
        plt.show()
        
        print("✅ Gráfico estático exibido")

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