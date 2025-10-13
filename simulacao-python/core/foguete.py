import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp
from matplotlib.animation import FuncAnimation
from matplotlib.patches import Circle, Rectangle
from .base import Simulacao
from .enums import TipoSimulacao

class RocketSimulation(Simulacao):
    def __init__(self, descricao="Simulação de Lançamento de Foguete"):
        super().__init__(descricao, TipoSimulacao.FOGUETE)
        self.thrust = 7607000  # N
        self.m0 = 549000       # kg
        self.m_propellant = 507000  # kg
        self.burn_time = 180   # s
        self.cd = 0.5
        self.area = 10         # m²
        self.g = 9.81
        self.rho = 1.225       # ar ao nível do mar
        self.t_max = 600       # tempo máximo da simulação
        self.t = None
        self.y = None
        self.v = None

    def mass(self, t):
        if t < self.burn_time:
            return self.m0 - (self.m_propellant / self.burn_time) * t
        else:
            return self.m0 - self.m_propellant

    def thrust_force(self, t):
        return self.thrust if t < self.burn_time else 0

    def equations_of_motion(self, t, state):
        y, v = state
        m = self.mass(t)
        thrust = self.thrust_force(t)
        drag = 0.5 * self.rho * self.cd * self.area * v**2 * np.sign(v)
        dvdt = (thrust - drag - m * self.g) / m
        return [v, dvdt]

    def executarSimulacao(self):
        """Executa a simulação do foguete"""
        print("Executando simulação de lançamento de foguete...")
        t_eval = np.linspace(0, self.t_max, 2000)
        sol = solve_ivp(self.equations_of_motion, [0, self.t_max], [0, 0], 
                       t_eval=t_eval, method='RK45')
        self.t, self.y, self.v = sol.t, sol.y[0], sol.y[1]
        return self

    def processarSimulacao(self):
        """Processa os resultados da simulação"""
        try:
            if self.y is None or self.v is None:
                self.resultado = "Erro: Simulação não foi executada."
                return False
            
            max_altitude = np.max(self.y)
            max_velocity = np.max(self.v)
            burnout_index = np.argmax(self.t >= self.burn_time)
            burnout_altitude = self.y[burnout_index] if burnout_index < len(self.y) else self.y[-1]
            burnout_velocity = self.v[burnout_index] if burnout_index < len(self.v) else self.v[-1]
            
            self.resultado = f"""
📊 RESULTADOS DA SIMULAÇÃO DE FOGUETE:
----------------------------------------
• Tipo: {self.tipo.value}
• Altitude máxima: {max_altitude:.2f} m
• Velocidade máxima: {max_velocity:.2f} m/s
• Altitude no burnout: {burnout_altitude:.2f} m
• Velocidade no burnout: {burnout_velocity:.2f} m/s
• Tempo de queima: {self.burn_time} s
• Data da simulação: {self.dataExecucao}
"""
            return True
        except Exception as e:
            self.resultado = f"Erro no processamento: {e}"
            return False

    def criar_animacao(self):
        """Cria animação do lançamento do foguete - CAIXA NO CANTO SUPERIOR DIREITO"""
        print("Criando animação do foguete...")
        if self.y is None:
            print("Erro: Execute a simulação primeiro.")
            return
        
        # Limita o número de frames para melhor performance
        total_frames = min(500, len(self.t))
        step = max(1, len(self.t) // total_frames)
        frame_indices = range(0, len(self.t), step)
        
        fig, ax = plt.subplots(figsize=(10, 12))
        
        # Configuração do gráfico
        max_alt = max(self.y) * 1.1
        ax.set_xlim(-50, 50)
        ax.set_ylim(-max_alt * 0.05, max_alt)
        ax.set_title(f"🚀 {self.tipo.value}", fontsize=14, fontweight='bold')
        ax.set_xlabel("Posição X (m)")
        ax.set_ylabel("Altitude (m)")
        ax.grid(True, alpha=0.3)
        
        # Elementos gráficos
        rocket, = ax.plot([], [], 'r^', markersize=20, markeredgecolor='darkred', 
                         markerfacecolor='red', label='Foguete')
        
        # Plataforma de lançamento
        platform = Rectangle((-8, -max_alt * 0.04), 16, max_alt * 0.02, 
                           color='gray', alpha=0.7, label='Plataforma')
        ax.add_patch(platform)
        
        # Chama do foguete
        flame, = ax.plot([], [], 'y-', linewidth=3, alpha=0.8, label='Propulsão')
        
        # Trajetória
        trajectory, = ax.plot([], [], 'b--', alpha=0.5, linewidth=1, label='Trajetória')
        
        # Texto informativo - CANTO SUPERIOR DIREITO
        info_text = ax.text(0.98, 0.98, "", transform=ax.transAxes, fontsize=10,
                          verticalalignment='top', horizontalalignment='right',
                          bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
        
        # Legenda no canto superior esquerdo
        ax.legend(loc='upper left')

        def init():
            """Inicializa a animação"""
            rocket.set_data([], [])
            flame.set_data([], [])
            trajectory.set_data([], [])
            info_text.set_text("")
            return rocket, flame, trajectory, info_text

        def animate(frame_idx):
            """Atualiza o frame da animação"""
            i = frame_indices[frame_idx] if frame_idx < len(frame_indices) else frame_indices[-1]
            
            # Posição atual do foguete
            current_altitude = self.y[i]
            current_velocity = self.v[i]
            current_time = self.t[i]
            
            # Foguete (sempre no centro)
            rocket.set_data([0], [current_altitude])
            
            # Chama (visível apenas durante a queima)
            if current_time < self.burn_time:
                flame_length = 10 + (current_time / self.burn_time) * 20
                flame.set_data([0, 0], [current_altitude - 5, current_altitude - flame_length])
                flame.set_alpha(0.8)
            else:
                flame.set_data([], [])
                flame.set_alpha(0)
            
            # Trajetória (últimos 20% dos pontos)
            start_idx = max(0, i - len(self.t) // 5)
            trajectory.set_data(np.zeros(i - start_idx + 1), self.y[start_idx:i+1])
            
            # Informações em tempo real - CANTO SUPERIOR DIREITO
            phase = "FASE DE PROPULSÃO" if current_time < self.burn_time else "FASE BALÍSTICA"
            info_text.set_text(
                f"⏰ Tempo: {current_time:.1f} s\n"
                f"📍 Altitude: {current_altitude:.0f} m\n"
                f"🚀 Velocidade: {current_velocity:.0f} m/s\n"
                f"📊 Fase: {phase}\n"
                f"🛰️ Frame: {frame_idx+1}/{len(frame_indices)}"
            )
            
            return rocket, flame, trajectory, info_text

        # Cria a animação
        ani = FuncAnimation(
            fig, animate, frames=len(frame_indices),
            init_func=init, interval=30, blit=True, repeat=True
        )
        
        plt.tight_layout()
        plt.show()
        return ani

    def criar_animacao_detalhada(self):
        """Versão alternativa com layout mais organizado"""
        print("Criando animação detalhada do foguete...")
        if self.y is None:
            print("Erro: Execute a simulação primeiro.")
            return
        
        total_frames = min(400, len(self.t))
        step = max(1, len(self.t) // total_frames)
        frame_indices = range(0, len(self.t), step)
        
        fig, ax = plt.subplots(figsize=(12, 10))
        
        # Configuração do gráfico
        max_alt = max(self.y) * 1.1
        ax.set_xlim(-50, 50)
        ax.set_ylim(-max_alt * 0.05, max_alt)
        ax.set_title(f"🚀 SIMULAÇÃO DE LANÇAMENTO DE FOGUETE", fontsize=16, fontweight='bold', pad=20)
        ax.set_xlabel("Posição X (m)")
        ax.set_ylabel("Altitude (m)")
        ax.grid(True, alpha=0.3)
        
        # Elementos gráficos
        rocket, = ax.plot([], [], 'r^', markersize=25, markeredgecolor='darkred', 
                         markerfacecolor='red', zorder=10)
        
        # Plataforma de lançamento
        platform = Rectangle((-10, -max_alt * 0.03), 20, max_alt * 0.03, 
                           color='#8B4513', alpha=0.8)
        ax.add_patch(platform)
        
        # Chama do foguete
        flame, = ax.plot([], [], 'y-', linewidth=4, alpha=0.9, zorder=5)
        
        # Trajetória
        trajectory, = ax.plot([], [], 'b-', alpha=0.6, linewidth=2, zorder=1)
        
        # CAIXA DE INFORMAÇÕES - CANTO SUPERIOR DIREITO
        info_box = ax.text(0.98, 0.95, "", transform=ax.transAxes, fontsize=11,
                          verticalalignment='top', horizontalalignment='right',
                          bbox=dict(boxstyle='round,pad=0.5', facecolor='lightyellow', 
                                  alpha=0.9, edgecolor='orange'))
        
        # Legenda de elementos no canto superior esquerdo
        legend_elements = [
            plt.Line2D([0], [0], marker='^', color='w', markerfacecolor='red', 
                      markersize=10, label='Foguete'),
            plt.Line2D([0], [0], color='yellow', linewidth=3, label='Propulsão'),
            plt.Line2D([0], [0], color='blue', linewidth=2, label='Trajetória')
        ]
        ax.legend(handles=legend_elements, loc='upper left', framealpha=0.9)

        def init():
            rocket.set_data([], [])
            flame.set_data([], [])
            trajectory.set_data([], [])
            info_box.set_text("")
            return rocket, flame, trajectory, info_box

        def animate(frame_idx):
            i = frame_indices[frame_idx] if frame_idx < len(frame_indices) else frame_indices[-1]
            
            current_altitude = self.y[i]
            current_velocity = self.v[i]
            current_time = self.t[i]
            
            # Foguete
            rocket.set_data([0], [current_altitude])
            
            # Chama
            if current_time < self.burn_time:
                flame_intensity = 0.9 - (current_time / self.burn_time) * 0.3
                flame_length = 15 + (current_time / self.burn_time) * 25
                flame.set_data([0, 0], [current_altitude - 8, current_altitude - flame_length])
                flame.set_alpha(flame_intensity)
                flame.set_color('yellow')
            else:
                flame.set_data([], [])
                flame.set_alpha(0)
            
            # Trajetória completa
            trajectory.set_data(np.zeros(i + 1), self.y[:i+1])
            
            # INFORMAÇÕES - CANTO SUPERIOR DIREITO
            phase = "🔥 PROPULSÃO" if current_time < self.burn_time else "🛰️ BALÍSTICA"
            mass_current = self.mass(current_time)
            mass_percent = (mass_current / self.m0) * 100
            
            info_box.set_text(
                f"📊 INFORMAÇÕES DA MISSÃO\n"
                f"⏰ Tempo: {current_time:6.1f} s\n"
                f"📍 Altitude: {current_altitude:6.0f} m\n"
                f"🚀 Velocidade: {current_velocity:5.0f} m/s\n"
                f"⚖️ Massa: {mass_percent:5.1f}%\n"
                f"📈 Fase: {phase}\n"
                f"🔄 Progresso: {frame_idx+1:3d}/{len(frame_indices)}"
            )
            
            return rocket, flame, trajectory, info_box

        ani = FuncAnimation(
            fig, animate, frames=len(frame_indices),
            init_func=init, interval=35, blit=True, repeat=True
        )
        
        plt.tight_layout()
        plt.show()
        return ani