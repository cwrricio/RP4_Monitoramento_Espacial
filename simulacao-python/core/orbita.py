import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from matplotlib.patches import Circle
from core.base import Simulacao
from core.enums import TipoSimulacao


class OrbitalSimulation(Simulacao):
    def __init__(self, descricao="Simulação de Satélite em Órbita"):
        super().__init__(descricao, TipoSimulacao.ORBITA)

        # Constantes físicas
        self.G = 6.67430e-11  # Constante gravitacional (m³/kg/s²)
        self.M = 5.9722e24    # Massa da Terra (kg)
        self.R = 6.371e6      # Raio da Terra (m)

        # Parâmetros da simulação
        self.h = 400000       # Altitude inicial (m)
        self.dt = 5           # Passo de tempo (s)
        self.t_max = 6000     # Tempo total de simulação (s)

        # Dados da simulação
        self.positions = None
        self.velocities = None
        self.altitudes = None
        self.times = None
        self.resultado = None

    # Simulação principal - Método RK4
    def executarSimulacao(self):
        """Executa a simulação orbital usando método RK4."""
        print("Executando simulação orbital com método RK4...")
        
        # Condições iniciais
        r0 = self.R + self.h
        v0 = np.sqrt(self.G * self.M / r0)  # Velocidade orbital

        # Estado inicial: [x, y, vx, vy]
        state = np.array([r0, 0.0, 0.0, v0])
        
        n_steps = int(self.t_max / self.dt)
        positions = np.zeros((n_steps, 2))
        velocities = np.zeros((n_steps, 2))
        altitudes = np.zeros(n_steps)
        times = np.zeros(n_steps)

        def orbital_derivatives(t, state_vec):
            """Calcula as derivadas para o sistema orbital."""
            x, y, vx, vy = state_vec
            r = np.sqrt(x**2 + y**2)
            
            # Evita divisão por zero
            if r < self.R:
                r = self.R
                
            # Aceleração gravitacional
            factor = -self.G * self.M / (r**3)
            ax = factor * x
            ay = factor * y
            
            return np.array([vx, vy, ax, ay])

        # Integração temporal com RK4
        for i in range(n_steps):
            times[i] = i * self.dt
            
            # Método RK4
            k1 = self.dt * orbital_derivatives(times[i], state)
            k2 = self.dt * orbital_derivatives(times[i] + self.dt/2, state + k1/2)
            k3 = self.dt * orbital_derivatives(times[i] + self.dt/2, state + k2/2)
            k4 = self.dt * orbital_derivatives(times[i] + self.dt, state + k3)
            
            state = state + (k1 + 2*k2 + 2*k3 + k4) / 6

            # Armazena resultados
            positions[i] = state[0:2]
            velocities[i] = state[2:4]
            altitudes[i] = np.linalg.norm(state[0:2]) - self.R

        self.positions = positions
        self.velocities = velocities
        self.altitudes = altitudes
        self.times = times
        
        print(f"Simulação RK4 concluída: {n_steps} passos, {self.t_max/60:.1f} minutos simulados")
        return self

    # Processamento dos resultados
    def processarSimulacao(self):
        """Processa os resultados calculando parâmetros orbitais."""
        try:
            if self.positions is None:
                self.resultado = "Erro: Simulação não foi executada."
                return False

            # Cálculos de parâmetros orbitais
            pos_norms = np.linalg.norm(self.positions, axis=1)
            vel_norms = np.linalg.norm(self.velocities, axis=1)
            
            orbital_radius = np.mean(pos_norms)
            orbital_period = 2 * np.pi * np.sqrt(orbital_radius**3 / (self.G * self.M))
            orbital_velocity = np.sqrt(self.G * self.M / orbital_radius)
            altitude_media = (orbital_radius - self.R) / 1000
            
            # Calcula número de órbitas completas
            orbitas_completas = self.t_max / orbital_period
            
            # Energia orbital
            energies = 0.5 * vel_norms**2 - self.G * self.M / pos_norms
            energy_conservation = np.std(energies) / np.mean(np.abs(energies))
            
            # Excentricidade aproximada
            min_alt = np.min(self.altitudes)
            max_alt = np.max(self.altitudes)
            eccentricity = (max_alt - min_alt) / (max_alt + min_alt + 2 * self.R)

            self.resultado = f"""
RESULTADOS DA SIMULAÇÃO ORBITAL
===================================
• Tipo: {self.tipo.value}
• Altitude média: {altitude_media:.2f} km
• Período orbital: {orbital_period:.2f} s ({orbital_period/60:.2f} min)
• Velocidade orbital: {orbital_velocity:.2f} m/s
• Órbitas simuladas: {orbitas_completas:.2f}
• Excentricidade: {eccentricity:.4f}
• Conservação de energia: {energy_conservation:.2e}
• Data: {self.dataExecucao}

PARÂMETROS DA SIMULAÇÃO:
• Altitude inicial: {self.h/1000:.1f} km
• Tempo total: {self.t_max} s ({self.t_max/60:.1f} min)
• Passo de integração: {self.dt} s
• Método: RK4
"""
            print(f"Órbitas completas simuladas: {orbitas_completas:.2f}")
            print(f"Conservação de energia: {energy_conservation:.2e}")
            
            return True
            
        except Exception as e:
            self.resultado = f"Erro no processamento: {e}"
            import traceback
            print(f"Detalhes do erro: {traceback.format_exc()}")
            return False

    # Animação detalhada
    def criar_animacao_detalhada(self):
        """Cria uma animação detalhada da órbita."""
        if self.positions is None:
            print("Execute a simulação primeiro.")
            return None

        print("Criando animação orbital detalhada...")
        
        # Prepara dados para animação
        tempos_min = self.times / 60
        velocidades = np.linalg.norm(self.velocities, axis=1)
        altitudes_km = self.altitudes / 1000
        
        # Limita frames para performance
        total_frames = min(500, len(self.positions))
        step = max(1, len(self.positions) // total_frames)
        frame_indices = range(0, len(self.positions), step)

        # Configura figura
        fig = plt.figure(figsize=(15, 10))
        gs = fig.add_gridspec(2, 3, width_ratios=[1.3, 1, 1])
        ax_orbita = fig.add_subplot(gs[:, 0])
        ax_altitude = fig.add_subplot(gs[0, 1:])
        ax_velocidade = fig.add_subplot(gs[1, 1:])

        # Gráfico da órbita
        max_range = 1.3 * (self.R + self.h)
        ax_orbita.set_xlim(-max_range, max_range)
        ax_orbita.set_ylim(-max_range, max_range)
        ax_orbita.set_aspect("equal")
        ax_orbita.set_title("Órbita do Satélite", fontsize=14, weight="bold")
        ax_orbita.set_xlabel("Posição X (m)")
        ax_orbita.set_ylabel("Posição Y (m)")
        ax_orbita.grid(True, alpha=0.3, linestyle="--")

        # Terra
        terra = Circle((0, 0), self.R, color="#1f77b4", alpha=0.8, label='Terra')
        atmosfera = Circle((0, 0), self.R * 1.02, color="#87ceeb", alpha=0.2, label='Atmosfera')
        ax_orbita.add_patch(terra)
        ax_orbita.add_patch(atmosfera)

        # Elementos da animação
        satelite, = ax_orbita.plot([], [], 'ro', markersize=10, markeredgecolor='darkred', 
                                  markerfacecolor='red', label="Satélite")
        trajetoria, = ax_orbita.plot([], [], 'r-', linewidth=2, alpha=0.6, label="Trajetória")
        ax_orbita.legend(loc='upper right', framealpha=0.9)

        # Gráfico de altitude
        ax_altitude.set_title("Altitude vs Tempo", fontsize=12, weight="bold")
        ax_altitude.set_ylabel("Altitude (km)")
        ax_altitude.set_xlim(0, tempos_min[-1])
        ax_altitude.set_ylim(np.min(altitudes_km) * 0.95, np.max(altitudes_km) * 1.05)
        ax_altitude.grid(True, alpha=0.3)
        linha_alt, = ax_altitude.plot([], [], 'g-', lw=2, label='Altitude')
        ponto_alt, = ax_altitude.plot([], [], 'go', markersize=6)
        ax_altitude.legend(loc='upper right')

        # Gráfico de velocidade
        ax_velocidade.set_title("Velocidade vs Tempo", fontsize=12, weight="bold")
        ax_velocidade.set_xlabel("Tempo (min)")
        ax_velocidade.set_ylabel("Velocidade (m/s)")
        ax_velocidade.set_xlim(0, tempos_min[-1])
        ax_velocidade.set_ylim(np.min(velocidades) * 0.95, np.max(velocidades) * 1.05)
        ax_velocidade.grid(True, alpha=0.3)
        linha_vel, = ax_velocidade.plot([], [], 'b-', lw=2, label='Velocidade')
        ponto_vel, = ax_velocidade.plot([], [], 'bo', markersize=6)
        ax_velocidade.legend(loc='upper right')

        # Textos informativos
        tempo_txt = ax_orbita.text(0.02, 0.98, "", transform=ax_orbita.transAxes,
                                  fontsize=11, weight="bold", va="top",
                                  bbox=dict(boxstyle="round,pad=0.4", fc="white", alpha=0.8))

        info_txt = fig.text(0.65, 0.02, "", fontsize=10, family="monospace",
                           bbox=dict(boxstyle="round,pad=0.5", fc="white", alpha=0.8))

        # Funções de animação
        def init():
            """Inicializa a animação."""
            satelite.set_data([], [])
            trajetoria.set_data([], [])
            linha_alt.set_data([], [])
            ponto_alt.set_data([], [])
            linha_vel.set_data([], [])
            ponto_vel.set_data([], [])
            tempo_txt.set_text("")
            info_txt.set_text("")
            return (satelite, trajetoria, linha_alt, ponto_alt, linha_vel, ponto_vel, tempo_txt, info_txt)

        def animate(frame_idx):
            """Atualiza o frame da animação."""
            i = frame_indices[frame_idx] if frame_idx < len(frame_indices) else frame_indices[-1]
            
            # Atualiza órbita
            x, y = self.positions[i]
            satelite.set_data([x], [y])
            
            # Trajetória (últimos 20% para performance)
            start_idx = max(0, i - len(self.positions) // 5)
            trajetoria.set_data(self.positions[start_idx:i+1, 0], 
                              self.positions[start_idx:i+1, 1])

            # Atualiza gráficos de altitude e velocidade
            linha_alt.set_data(tempos_min[:i+1], altitudes_km[:i+1])
            ponto_alt.set_data([tempos_min[i]], [altitudes_km[i]])

            linha_vel.set_data(tempos_min[:i+1], velocidades[:i+1])
            ponto_vel.set_data([tempos_min[i]], [velocidades[i]])

            # Atualiza textos
            tempo_txt.set_text(
                f"Tempo: {tempos_min[i]:.1f} min\n"
                f"Altitude: {altitudes_km[i]:.1f} km\n"
                f"Velocidade: {velocidades[i]:.0f} m/s\n"
                f"Frame: {frame_idx+1}/{len(frame_indices)}"
            )
            
            # Informações orbitais
            periodo_teorico = 2 * np.pi * np.sqrt((self.R + self.h)**3 / (self.G * self.M)) / 60
            info_txt.set_text(
                f"PERÍODO ORBITAL:\n"
                f"Teórico: {periodo_teorico:.1f} min\n"
                f"Simulado: {2*np.pi*np.sqrt(np.linalg.norm(self.positions[i])**3/(self.G*self.M))/60:.1f} min\n"
                f"ALTITUDE:\n"
                f"Média: {np.mean(altitudes_km):.1f} km\n"
                f"Variação: ±{(np.max(altitudes_km)-np.min(altitudes_km))/2:.1f} km\n"
                f"VELOCIDADE:\n"
                f"Média: {np.mean(velocidades):.0f} m/s\n"
                f"Variação: ±{(np.max(velocidades)-np.min(velocidades))/2:.0f} m/s"
            )
            
            return (satelite, trajetoria, linha_alt, ponto_alt, linha_vel, ponto_vel, tempo_txt, info_txt)

        # Cria animação
        ani = FuncAnimation(
            fig, animate, frames=len(frame_indices),
            init_func=init, interval=50, blit=False, repeat=True
        )

        # Configuração final
        fig.suptitle("SIMULAÇÃO ORBITAL - SATÉLITE EM ÓRBITA TERRESTRE",
                    fontsize=16, fontweight="bold", y=0.95)
        plt.tight_layout(rect=[0, 0.03, 1, 0.93])
        
        print("Animação criada com sucesso!")
        plt.show()
        return ani

    def criar_animacao(self):
        """Alias para compatibilidade com interface genérica."""
        return self.criar_animacao_detalhada()

    # Métodos auxiliares
    def plotar_trajetoria_simples(self):
        """Plota uma visualização simples da trajetória orbital."""
        if self.positions is None:
            print("Execute a simulação primeiro.")
            return
        
        plt.figure(figsize=(10, 10))
        plt.plot(self.positions[:, 0], self.positions[:, 1], 'b-', alpha=0.7, linewidth=2, label='Trajetória')
        plt.plot(self.positions[0, 0], self.positions[0, 1], 'go', markersize=8, label='Início')
        plt.plot(self.positions[-1, 0], self.positions[-1, 1], 'ro', markersize=8, label='Fim')
        
        # Terra
        terra = Circle((0, 0), self.R, color='blue', alpha=0.6, label='Terra')
        plt.gca().add_patch(terra)
        
        plt.gca().set_aspect('equal')
        plt.xlabel("Posição X (m)")
        plt.ylabel("Posição Y (m)")
        plt.title("Trajetória Orbital do Satélite")
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.show()

    def obter_resultados(self):
        """Retorna os resultados da simulação."""
        return self.resultado

    def obter_dados_simulacao(self):
        """Retorna todos os dados da simulação."""
        return {
            'positions': self.positions,
            'velocities': self.velocities,
            'altitudes': self.altitudes,
            'times': self.times
        }