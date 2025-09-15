import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from scipy.integrate import solve_ivp
import matplotlib.patches as patches
import json

class RocketSimulation:
    def __init__(self):
        # Constantes físicas
        self.G = 6.67430e-11  # Constante gravitacional (m³/kg/s²)
        self.M_earth = 5.972e24  # Massa da Terra (kg)
        self.R_earth = 6371000  # Raio da Terra (m)
        
        # Parâmetros do foguete (baseado no Falcon 9)
        self.m0 = 549000  # Massa inicial (kg)
        self.m_propellant = 507000  # Massa de propelente (kg)
        self.thrust = 7607000  # Empuxo máximo (N)
        self.burn_time = 162  # Tempo de queima (s)
        self.exhaust_velocity = 3000  # Velocidade de exaustão (m/s)
        
        # Coeficiente aerodinâmico (simplificado)
        self.cd = 0.5  # Coeficiente de arrasto
        self.area = 10.0  # Área de referência (m²)
        
        # Condições iniciais
        self.y0 = 0  # Altitude inicial (m)
        self.v0 = 0  # Velocidade inicial (m/s)
        
        # Parâmetros de simulação
        self.t_max = 600  # Tempo máximo de simulação (s)
        self.dt = 0.1  # Passo de tempo (s)
        
    def mass_flow_rate(self, t):
        """Taxa de consumo de combustível"""
        if t < self.burn_time:
            return self.m_propellant / self.burn_time
        return 0
    
    def mass(self, t):
        """Massa do foguete no tempo t"""
        if t < self.burn_time:
            return self.m0 - self.mass_flow_rate(t) * t
        return self.m0 - self.m_propellant
    
    def thrust_force(self, t):
        """Empuxo do foguete no tempo t"""
        if t < self.burn_time:
            return self.thrust
        return 0
    
    def gravity_force(self, y):
        """Força gravitacional em função da altitude"""
        r = self.R_earth + y
        return self.G * self.M_earth * self.mass(0) / (r * r)
    
    def air_density(self, y):
        """Densidade do ar em função da altitude (modelo simplificado)"""
        # Modelo exponencial simplificado
        if y > 80000:  # Acima da atmosfera
            return 0
        return 1.225 * np.exp(-y / 8500)
    
    def drag_force(self, t, v, y):
        """Força de arrasto aerodinâmico"""
        rho = self.air_density(y)
        return 0.5 * rho * v * abs(v) * self.cd * self.area
    
    def equations_of_motion(self, t, state):
        """Equações diferenciais do movimento do foguete"""
        y, v = state
        
        # Massa atual
        m = self.mass(t)
        
        # Forças atuando no foguete
        thrust = self.thrust_force(t)
        gravity = self.gravity_force(y)
        drag = self.drag_force(t, v, y)
        
        # Se o foguete está no solo e a força para cima é menor que o peso, não se move
        if y <= 0 and (thrust - gravity - drag) < 0:
            return [0, 0]
        
        # Aceleração (F = ma)
        a = (thrust - gravity - drag) / m
        
        return [v, a]
    
    def simulate(self):
        """Executa a simulação"""
        # Condições iniciais [altitude, velocidade]
        initial_state = [self.y0, self.v0]
        
        # Tempo de simulação
        t_eval = np.arange(0, self.t_max, self.dt)
        
        # Resolver equações diferenciais
        solution = solve_ivp(
            self.equations_of_motion,
            [0, self.t_max],
            initial_state,
            t_eval=t_eval,
            method='RK45',
            rtol=1e-6,
            atol=1e-9
        )
        
        return solution.t, solution.y[0], solution.y[1]
    
    def save_results_to_json(self, t, y, v, filename="resultado_simulacao.json"):
        data = {
        "tempo": t.tolist(),
        "altitude": y.tolist(),
        "velocidade": v.tolist()
    }
        with open(filename, "w") as f:
            json.dump(data, f, indent=4)
    
    def plot_results(self, t, y, v):
        """Plota os resultados da simulação"""
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(14, 10))
        
        # Altitude vs Tempo
        ax1.plot(t, y / 1000, 'b-', linewidth=2)
        ax1.set_xlabel('Tempo (s)', fontsize=12)
        ax1.set_ylabel('Altitude (km)', fontsize=12)
        ax1.set_title('Altitude do Foguete', fontsize=14, fontweight='bold')
        ax1.grid(True, alpha=0.3)
        ax1.tick_params(axis='both', which='major', labelsize=10)
        
        # Destacar eventos importantes
        burnout_idx = np.where(t >= self.burn_time)[0][0]
        apogee_idx = np.argmax(y)
        ax1.axvline(x=t[burnout_idx], color='r', linestyle='--', alpha=0.7, label='Fim da queima')
        ax1.axvline(x=t[apogee_idx], color='g', linestyle='--', alpha=0.7, label='Apogeu')
        ax1.legend()
        
        # Velocidade vs Tempo
        ax2.plot(t, v / 1000, 'r-', linewidth=2)
        ax2.set_xlabel('Tempo (s)', fontsize=12)
        ax2.set_ylabel('Velocidade (km/s)', fontsize=12)
        ax2.set_title('Velocidade do Foguete', fontsize=14, fontweight='bold')
        ax2.grid(True, alpha=0.3)
        ax2.tick_params(axis='both', which='major', labelsize=10)
        
        # Aceleração vs Tempo
        acceleration = np.gradient(v, t)
        ax3.plot(t, acceleration / 9.81, 'purple', linewidth=2)
        ax3.set_xlabel('Tempo (s)', fontsize=12)
        ax3.set_ylabel('Aceleração (g)', fontsize=12)
        ax3.set_title('Aceleração do Foguete', fontsize=14, fontweight='bold')
        ax3.grid(True, alpha=0.3)
        ax3.tick_params(axis='both', which='major', labelsize=10)
        
        # Massa vs Tempo
        mass = np.array([self.mass(time) for time in t])
        ax4.plot(t, mass / 1000, 'orange', linewidth=2)
        ax4.set_xlabel('Tempo (s)', fontsize=12)
        ax4.set_ylabel('Massa (toneladas)', fontsize=12)
        ax4.set_title('Massa do Foguete', fontsize=14, fontweight='bold')
        ax4.grid(True, alpha=0.3)
        ax4.tick_params(axis='both', which='major', labelsize=10)
        
        plt.tight_layout()
        plt.savefig('rocket_simulation_detailed.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def create_detailed_animation(self, t, y, v):
        """Cria uma animação detalhada do lançamento"""
        print("Criando animação detalhada...")
        
        # Configuração para uma animação mais detalhada
        step = max(1, len(t) // 400)  # 400 frames para mais detalhes
        t_anim = t[::step]
        y_anim = y[::step]
        v_anim = v[::step]
        
        # Criar figura com subplots
        fig = plt.figure(figsize=(15, 10))
        gs = fig.add_gridspec(2, 2, width_ratios=[2, 1])
        
        # Subplot principal para a animação
        ax1 = fig.add_subplot(gs[:, 0])
        
        # Subplots para dados em tempo real
        ax2 = fig.add_subplot(gs[0, 1])  # Altitude
        ax3 = fig.add_subplot(gs[1, 1])  # Velocidade
        
        # Configurar eixo principal
        max_altitude = max(y) * 1.2
        ax1.set_xlim(-max_altitude/8, max_altitude/8)
        ax1.set_ylim(0, max_altitude)
        ax1.set_xlabel('Distância (m)', fontsize=12)
        ax1.set_ylabel('Altitude (m)', fontsize=12)
        ax1.set_title('Simulação de Lançamento de Foguete', fontsize=16, fontweight='bold')
        ax1.grid(True, alpha=0.3)
        
        # Desenhar Terra com mais detalhes
        earth_radius = self.R_earth / 20000  # Escala reduzida para visualização
        earth = patches.Circle((0, -earth_radius), earth_radius, color='#2E86AB', alpha=0.8)
        ax1.add_patch(earth)
        
        # Adicionar atmosfera
        atmosphere = patches.Circle((0, -earth_radius), earth_radius * 1.1, 
                                   color='#87CEEB', alpha=0.2)
        ax1.add_patch(atmosphere)
        
        # Configurar gráficos de dados
        ax2.set_xlim(0, max(t))
        ax2.set_ylim(0, max(y)/1000 * 1.1)
        ax2.set_ylabel('Altitude (km)', fontsize=10)
        ax2.set_title('Altitude vs Tempo', fontsize=12)
        ax2.grid(True, alpha=0.3)
        
        ax3.set_xlim(0, max(t))
        ax3.set_ylim(min(v)/1000 * 1.1, max(v)/1000 * 1.1)
        ax3.set_xlabel('Tempo (s)', fontsize=10)
        ax3.set_ylabel('Velocidade (km/s)', fontsize=10)
        ax3.set_title('Velocidade vs Tempo', fontsize=12)
        ax3.grid(True, alpha=0.3)
        
        # Elementos da animação
        rocket, = ax1.plot([], [], 'ro', markersize=8, markerfacecolor='red', markeredgecolor='darkred')
        flame = ax1.plot([], [], 'y-', linewidth=3, alpha=0.8)[0]
        trajectory, = ax1.plot([], [], 'r-', alpha=0.3, linewidth=1)
        
        # Linhas para gráficos em tempo real
        alt_line, = ax2.plot([], [], 'b-', linewidth=2)
        vel_line, = ax3.plot([], [], 'r-', linewidth=2)
        
        # Texto para informações
        info_text = ax1.text(0.02, 0.98, '', transform=ax1.transAxes, fontsize=11,
                           bbox=dict(boxstyle="round,pad=0.5", facecolor="white", alpha=0.9))
        
        # Listas para armazenar dados
        x_points, y_points = [], []
        time_points, alt_points, vel_points = [], [], []
        
        def init():
            rocket.set_data([], [])
            flame.set_data([], [])
            trajectory.set_data([], [])
            alt_line.set_data([], [])
            vel_line.set_data([], [])
            info_text.set_text('')
            return rocket, flame, trajectory, alt_line, vel_line, info_text
        
        def update(frame):
            # Dados atuais
            current_time = t_anim[frame]
            current_altitude = y_anim[frame]
            current_velocity = v_anim[frame]
            
            # Atualizar foguete
            rocket.set_data([0], [current_altitude])
            
            # Atualizar chama (tamanho proporcional ao empuxo)
            thrust_ratio = self.thrust_force(current_time) / self.thrust
            flame_length = 10 + 40 * thrust_ratio  # Comprimento variável da chama
            flame.set_data([0, 0], [current_altitude - flame_length, current_altitude])
            
            # Atualizar trajetória
            x_points.append(0)
            y_points.append(current_altitude)
            trajectory.set_data(x_points, y_points)
            
            # Atualizar gráficos em tempo real
            time_points.append(current_time)
            alt_points.append(current_altitude / 1000)  # Converter para km
            vel_points.append(current_velocity / 1000)  # Converter para km/s
            
            alt_line.set_data(time_points, alt_points)
            vel_line.set_data(time_points, vel_points)
            
            # Atualizar informações
            mass_current = self.mass(current_time) / 1000  # Toneladas
            info_text.set_text(
                f'Tempo: {current_time:.1f} s\n'
                f'Altitude: {current_altitude/1000:.1f} km\n'
                f'Velocidade: {current_velocity/1000:.1f} km/s\n'
                f'Massa: {mass_current:.0f} t\n'
                f'Fase: {"Queima" if current_time < self.burn_time else "Balística"}'
            )
            
            return rocket, flame, trajectory, alt_line, vel_line, info_text
        
        # Criar animação
        anim = FuncAnimation(fig, update, frames=len(t_anim), init_func=init, 
                            interval=30, blit=True, repeat=False)
        
        plt.tight_layout()
        
        # Salvar animação com alta qualidade
        try:
            print("Salvando animação detalhada (pode demorar alguns minutos)...")
            anim.save('rocket_launch_detailed.gif', writer='pillow', fps=25, dpi=100)
            print("Animação detalhada salva como 'rocket_launch_detailed.gif'")
        except Exception as e:
            print(f"Não foi possível salvar a animação: {e}")
            # Tentar salvar com qualidade menor
            try:
                anim.save('rocket_launch_detailed.gif', writer='pillow', fps=15, dpi=80)
                print("Animação salva com qualidade reduzida")
            except Exception as e2:
                print(f"Falha ao salvar animação: {e2}")
        
        # Mostrar animação
        print("Mostrando animação... Feche a janela para ver os gráficos detalhados.")
        plt.show()
        
        return anim

# Executar a simulação
if __name__ == "__main__":
    print("Iniciando simulação detalhada de lançamento de foguete...")
    
    # Criar e executar simulação
    simulator = RocketSimulation()
    t, y, v = simulator.simulate()
    
    # Encontrar eventos importantes
    burnout_index = np.where(t >= simulator.burn_time)[0][0]
    apogee_index = np.argmax(y)
    
    print(f"Tempo de queima: {simulator.burn_time} s")
    print(f"Altitude no fim da queima: {y[burnout_index]/1000:.2f} km")
    print(f"Velocidade no fim da queima: {v[burnout_index]/1000:.2f} km/s")
    print(f"Apogeu: {y[apogee_index]/1000:.2f} km")
    print(f"Tempo até o apogeu: {t[apogee_index]:.2f} s")
    
    # Mostrar animação detalhada
    anim = simulator.create_detailed_animation(t, y, v)
    
    # Mostrar gráficos detalhados
    print("Gerando gráficos detalhados...")
    simulator.plot_results(t, y, v)
    
    print("Simulação concluída!")
    print("Arquivos gerados:")
    print("- rocket_launch_detailed.gif (animação)")
    print("- rocket_simulation_detailed.png (gráficos)")