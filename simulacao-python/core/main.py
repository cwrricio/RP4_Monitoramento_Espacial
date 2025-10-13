import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from scipy.integrate import solve_ivp
import matplotlib.patches as patches
from matplotlib.patches import Circle, Rectangle, Ellipse
import json
from datetime import datetime, date
from enum import Enum
import math

class TipoSimulacao(Enum):
    FOGUETE = "Lançamento de Foguete"
    ORBITA = "Satélite em Órbita"
    REENTRADA = "Reentrada Atmosférica"

class Gravidade(Enum):
    BAIXA = "Baixa"
    MEDIA = "Média"
    ALTA = "Alta"
    CRITICA = "Crítica"

class Simulacao:
    def __init__(self, descricao, tipo):
        self.descricao = descricao
        self.tipo = tipo
        self.resultado = ""
        self.dataExecucao = date.today()
    
    def processarSimulacao(self):
        try:
            self.resultado = "Simulação processada com sucesso"
            return True
        except Exception as e:
            self.resultado = f"Erro no processamento: {str(e)}"
            return False

class RocketSimulation(Simulacao):
    def __init__(self, descricao="Simulação de Lançamento de Foguete"):
        super().__init__(descricao, TipoSimulacao.FOGUETE)
        
        # Constantes físicas
        self.G = 6.67430e-11
        self.M_earth = 5.972e24
        self.R_earth = 6371000
        
        # Parâmetros do foguete
        self.m0 = 549000
        self.m_propellant = 507000
        self.thrust = 7607000
        self.burn_time = 162
        self.exhaust_velocity = 3000
        
        self.cd = 0.5
        self.area = 10.0
        
        # Condições iniciais
        self.y0 = 0
        self.v0 = 0
        
        # Parâmetros de simulação
        self.t_max = 600
        self.dt = 5
        
        # Resultados
        self.t = None
        self.y = None
        self.v = None
        
    def mass_flow_rate(self, t):
        if t < self.burn_time:
            return self.m_propellant / self.burn_time
        return 0
    
    def mass(self, t):
        if t < self.burn_time:
            return self.m0 - self.mass_flow_rate(t) * t
        return self.m0 - self.m_propellant
    
    def thrust_force(self, t):
        if t < self.burn_time:
            return self.thrust
        return 0
    
    def gravity_force(self, y):
        r = self.R_earth + y
        return self.G * self.M_earth * self.mass(0) / (r * r)
    
    def air_density(self, y):
        if y > 80000:
            return 0
        return 1.225 * np.exp(-y / 8500)
    
    def drag_force(self, t, v, y):
        rho = self.air_density(y)
        return 0.5 * rho * v * abs(v) * self.cd * self.area
    
    def equations_of_motion(self, t, state):
        y, v = state
        
        m = self.mass(t)
        
        thrust = self.thrust_force(t)
        gravity = self.gravity_force(y)
        drag = self.drag_force(t, v, y)
        
        if y <= 0 and (thrust - gravity - drag) < 0:
            return [0, 0]
        
        a = (thrust - gravity - drag) / m
        
        return [v, a]
    
    def executarSimulacao(self):
        initial_state = [self.y0, self.v0]
        t_eval = np.arange(0, self.t_max, self.dt)
        
        solution = solve_ivp(
            self.equations_of_motion,
            [0, self.t_max],
            initial_state,
            t_eval=t_eval,
            method='RK45',
            rtol=1e-6,
            atol=1e-9
        )
        
        self.t = solution.t
        self.y = solution.y[0]
        self.v = solution.y[1]
        
        burnout_index = np.where(self.t >= self.burn_time)[0][0]
        apogee_index = np.argmax(self.y)
        
        self.resultado = (f"Simulação de foguete concluída. "
                         f"Apogeu: {self.y[apogee_index]/1000:.2f} km, "
                         f"Velocidade máxima: {np.max(self.v)/1000:.2f} km/s")
        
        return self

    def criar_animacao(self):
        """Cria animação do lançamento do foguete"""
        if self.t is None or self.y is None or self.v is None:
            print("Erro: Execute a simulação primeiro")
            return

        fig = plt.figure(figsize=(15, 10))
        gs = plt.GridSpec(3, 2, figure=fig)
        ax_main = fig.add_subplot(gs[0:2, 0])
        ax_altitude = fig.add_subplot(gs[0, 1])
        ax_velocity = fig.add_subplot(gs[1, 1])
        ax_info = fig.add_subplot(gs[2, :])
        ax_info.axis('off')
        
        max_altitude = max(self.y)
        ax_main.set_xlim(-200, 200)
        ax_main.set_ylim(-50000, max_altitude * 1.2)
        ax_main.set_xlabel('Posição Horizontal (m)')
        ax_main.set_ylabel('Altitude (m)')
        ax_main.set_title('LANÇAMENTO DE FOGUETE', fontsize=14, fontweight='bold')
        ax_main.grid(True, alpha=0.3)
        
        earth_radius_display = 50000
        earth = Circle((0, -earth_radius_display), earth_radius_display, 
                      color='#1f77b4', alpha=0.7)
        ax_main.add_patch(earth)
        
        ax_altitude.set_xlim(0, self.t_max)
        ax_altitude.set_ylim(0, max_altitude)
        ax_altitude.set_ylabel('Altitude (m)')
        ax_altitude.set_title('ALTITUDE vs TEMPO', fontsize=12, fontweight='bold')
        ax_altitude.grid(True, alpha=0.3)
        
        ax_velocity.set_xlim(0, self.t_max)
        ax_velocity.set_ylim(min(self.v), max(self.v) * 1.1)
        ax_velocity.set_xlabel('Tempo (s)')
        ax_velocity.set_ylabel('Velocidade (m/s)')
        ax_velocity.set_title('VELOCIDADE vs TEMPO', fontsize=12, fontweight='bold')
        ax_velocity.grid(True, alpha=0.3)
        
        # Elementos animados
        rocket_body, = ax_main.plot([], [], 'red', linewidth=8, marker='o', markersize=12)
        rocket_flame, = ax_main.plot([], [], 'orange', linewidth=4, alpha=0.8)
        trajectory, = ax_main.plot([], [], 'r--', alpha=0.6, linewidth=2)
        
        altitude_line, = ax_altitude.plot([], [], 'b-', linewidth=2)
        altitude_point, = ax_altitude.plot([], [], 'ro', markersize=6)
        velocity_line, = ax_velocity.plot([], [], 'g-', linewidth=2)
        velocity_point, = ax_velocity.plot([], [], 'ro', markersize=6)
        
        time_text = ax_info.text(0.02, 0.8, '', fontsize=11, transform=ax_info.transAxes)
        alt_text = ax_info.text(0.02, 0.6, '', fontsize=11, transform=ax_info.transAxes)
        vel_text = ax_info.text(0.02, 0.4, '', fontsize=11, transform=ax_info.transAxes)
        stage_text = ax_info.text(0.02, 0.2, '', fontsize=11, transform=ax_info.transAxes)
        
        traj_x, traj_y = [], []
        alt_data, vel_data, time_data = [], [], []
        
        def animate(frame):
            idx = min(frame, len(self.t) - 1)
            current_time = self.t[idx]
            current_alt = self.y[idx]
            current_vel = self.v[idx]
            
            # Foguete
            rocket_x = [0, 0]
            rocket_y = [current_alt - 100, current_alt + 100]
            rocket_body.set_data(rocket_x, rocket_y)
            
            # Chama
            if current_time < self.burn_time:
                flame_x = [0, 0]
                flame_y = [current_alt - 100, current_alt - 300]
                rocket_flame.set_data(flame_x, flame_y)
                rocket_flame.set_alpha(0.8)
            else:
                rocket_flame.set_alpha(0)
            
            # Trajetória
            traj_x.append(0)
            traj_y.append(current_alt)
            trajectory.set_data(traj_x, traj_y)
            
            # Gráficos
            time_data.append(current_time)
            alt_data.append(current_alt)
            vel_data.append(current_vel)
            
            altitude_line.set_data(time_data, alt_data)
            altitude_point.set_data([current_time], [current_alt])
            velocity_line.set_data(time_data, vel_data)
            velocity_point.set_data([current_time], [current_vel])
            
            # Textos
            time_text.set_text(f'Tempo: {current_time:.1f} s')
            alt_text.set_text(f'Altitude: {current_alt/1000:.2f} km')
            vel_text.set_text(f'Velocidade: {current_vel:.1f} m/s')
            
            if current_time < self.burn_time:
                stage_text.set_text('Fase: Propulsão Ativa')
            elif current_alt < max_altitude:
                stage_text.set_text('Fase: Ascensão Balística')
            else:
                stage_text.set_text('Fase: Apogeu Atingido')
            
            return (rocket_body, rocket_flame, trajectory, altitude_line, 
                   altitude_point, velocity_line, velocity_point, time_text, 
                   alt_text, vel_text, stage_text)
        
        total_frames = len(self.t)
        anim = FuncAnimation(fig, animate, frames=total_frames, 
                           interval=30, blit=True, repeat=True)
        
        plt.tight_layout()
        print("Salvando animação do lançamento de foguete...")
        anim.save('lancamento_foguete.gif', writer='pillow', fps=30, dpi=100)
        plt.show()
        return anim

class OrbitalSimulation(Simulacao):
    def __init__(self, descricao="Simulação de Satélite em Órbita"):
        super().__init__(descricao, TipoSimulacao.ORBITA)
        
        self.G = 6.67430e-11
        self.M_earth = 5.972e24
        self.R_earth = 6371000
        
        # Órbita circular a 400km de altitude
        self.altitude = 400000  # 400 km
        self.orbital_radius = self.R_earth + self.altitude
        self.orbital_velocity = math.sqrt(self.G * self.M_earth / self.orbital_radius)
        
        # Parâmetros do satélite
        self.satellite_mass = 1000  # kg
        self.satellite_size = 50  # para visualização
        
        # Tempo de simulação (2 órbitas)
        self.orbital_period = 2 * math.pi * math.sqrt(self.orbital_radius**3 / (self.G * self.M_earth))
        self.t_max = 2 * self.orbital_period  # 2 órbitas completas
        self.dt = 10  # segundos
        
        self.t = None
        self.x = None
        self.y = None
        self.vx = None
        self.vy = None
    
    def equations_of_motion(self, t, state):
        x, y, vx, vy = state
        r = math.sqrt(x**2 + y**2)
        
        # Força gravitacional
        F_grav = -self.G * self.M_earth * self.satellite_mass / r**3
        ax = F_grav * x / self.satellite_mass
        ay = F_grav * y / self.satellite_mass
        
        return [vx, vy, ax, ay]
    
    def executarSimulacao(self):
        # Condições iniciais - órbita circular
        x0 = self.orbital_radius
        y0 = 0
        vx0 = 0
        vy0 = self.orbital_velocity
        
        initial_state = [x0, y0, vx0, vy0]
        t_eval = np.arange(0, self.t_max, self.dt)
        
        solution = solve_ivp(
            self.equations_of_motion,
            [0, self.t_max],
            initial_state,
            t_eval=t_eval,
            method='RK45',
            rtol=1e-8
        )
        
        self.t = solution.t
        self.x = solution.y[0]
        self.y = solution.y[1]
        self.vx = solution.y[2]
        self.vy = solution.y[3]
        
        self.resultado = (f"Simulação orbital concluída. "
                         f"Altitude: {self.altitude/1000:.0f} km, "
                         f"Velocidade orbital: {self.orbital_velocity/1000:.2f} km/s, "
                         f"Período orbital: {self.orbital_period/60:.1f} min")
        
        return self
    
    def criar_animacao(self):
        if self.t is None:
            print("Erro: Execute a simulação primeiro")
            return

        fig = plt.figure(figsize=(12, 10))
        
        # Usar projeção polar para a órbita
        ax = fig.add_subplot(111, projection='polar')
        
        # Configurar plot polar
        max_r = self.orbital_radius * 1.2
        ax.set_ylim(0, max_r)
        ax.set_title('ÓRBITA SATELITAL', fontsize=14, fontweight='bold')
        ax.grid(True)
        
        # Terra no centro (em coordenadas polares)
        earth_radius_plot = self.R_earth / 3  # Escala reduzida para visualização
        theta_earth = np.linspace(0, 2*np.pi, 100)
        r_earth = np.ones(100) * earth_radius_plot
        ax.fill(theta_earth, r_earth, color='blue', alpha=0.7, label='Terra')
        
        # Elementos animados
        satellite, = ax.plot([], [], 'ro', markersize=8, label='Satélite')
        orbit_trail, = ax.plot([], [], 'r--', alpha=0.5, linewidth=1)
        
        info_text = ax.text(0.5, 1.05, '', transform=ax.transAxes, fontsize=11,
                           ha='center', va='bottom')
        
        theta_trail, r_trail = [], []
        
        def animate(frame):
            idx = min(frame, len(self.t) - 5)
            
            # Converter coordenadas cartesianas para polares
            theta = math.atan2(self.y[idx], self.x[idx])
            r = math.sqrt(self.x[idx]**2 + self.y[idx]**2)
            
            # Atualizar satélite
            satellite.set_data([theta], [r])
            
            # Atualizar trilha orbital
            theta_trail.append(theta)
            r_trail.append(r)
            orbit_trail.set_data(theta_trail, r_trail)
            
            # Informações
            velocity = math.sqrt(self.vx[idx]**2 + self.vy[idx]**2)
            altitude = r - self.R_earth
            orbits_completed = self.t[idx] / self.orbital_period
            
            info_text.set_text(f'Tempo: {self.t[idx]/60:.1f} min\n'
                             f'Altitude: {altitude/1000:.1f} km\n'
                             f'Velocidade: {velocity/1000:.2f} km/s\n'
                             f'Órbitas: {orbits_completed:.2f}')
            
            return satellite, orbit_trail, info_text
        
        total_frames = len(self.t)
        anim = FuncAnimation(fig, animate, frames=total_frames, 
                           interval=50, blit=True, repeat=True)
        
        plt.tight_layout()
        print("Salvando animação da órbita...")
        anim.save('orbita_satelite.gif', writer='pillow', fps=20, dpi=100)
        plt.show()
        return anim

class ReentrySimulation(Simulacao):
    def __init__(self, descricao="Simulação de Reentrada Atmosférica"):
        super().__init__(descricao, TipoSimulacao.REENTRADA)
        
        self.G = 6.67430e-11
        self.M_earth = 5.972e24
        self.R_earth = 6371000
        
        # Condições iniciais de reentrada
        self.altitude0 = 120000  # 120 km
        self.velocity0 = 7800    # Velocidade orbital
        self.angle0 = -1.5       # Ângulo de reentrada (graus)
        
        # Parâmetros da cápsula
        self.mass = 3000         # kg
        self.area = 4.0          # m²
        self.cd = 1.3            # Coeficiente de arrasto
        
        self.t_max = 600         # 10 minutos
        self.dt = 5
        
        self.t = None
        self.x = None
        self.y = None
        self.vx = None
        self.vy = None
        self.temperature = None
    
    def air_density(self, y):
        """Densidade do ar com modelo mais preciso para reentrada"""
        if y > 80000:
            return 1.225 * np.exp(-y / 7000) * 0.001
        elif y > 40000:
            return 1.225 * np.exp(-y / 7000)
        else:
            return 1.225 * np.exp(-y / 8000)
    
    def equations_of_motion(self, t, state):
        x, y, vx, vy = state
        v = math.sqrt(vx**2 + vy**2)
        r = math.sqrt(x**2 + y**2)
        altitude = r - self.R_earth
        
        if altitude <= 0:
            return [0, 0, 0, 0]
        
        # Gravidade
        g = self.G * self.M_earth / r**2
        gx = -g * x / r
        gy = -g * y / r
        
        # Arrasto
        rho = self.air_density(altitude)
        drag_force = 0.5 * rho * v**2 * self.cd * self.area
        drag_x = -drag_force * vx / v / self.mass
        drag_y = -drag_force * vy / v / self.mass
        
        ax = gx + drag_x
        ay = gy + drag_y
        
        return [vx, vy, ax, ay]
    
    def calculate_temperature(self, altitude, velocity):
        """Calcula temperatura superficial durante reentrada"""
        if altitude > 80000:
            return 300  # Temperatura ambiente no espaço
        
        rho = self.air_density(altitude)
        # Modelo simplificado de aquecimento aerodinâmico
        heating = 0.5 * rho * velocity**3 * 1e-7
        temperature = 300 + heating  # Temperatura base + aquecimento
        
        return min(temperature, 3000)  # Limite máximo
    
    def executarSimulacao(self):
        # Posição inicial (no início da reentrada)
        r0 = self.R_earth + self.altitude0
        angle_rad = math.radians(self.angle0)
        
        x0 = 0
        y0 = r0
        vx0 = self.velocity0 * math.cos(angle_rad)
        vy0 = self.velocity0 * math.sin(angle_rad)
        
        initial_state = [x0, y0, vx0, vy0]
        t_eval = np.arange(0, self.t_max, self.dt)
        
        solution = solve_ivp(
            self.equations_of_motion,
            [0, self.t_max],
            initial_state,
            t_eval=t_eval,
            method='RK45',
            rtol=1e-6
        )
        
        self.t = solution.t
        self.x = solution.y[0]
        self.y = solution.y[1]
        self.vx = solution.y[2]
        self.vy = solution.y[3]
        
        # Calcular temperatura
        self.temperature = []
        for i in range(len(self.t)):
            altitude = math.sqrt(self.x[i]**2 + self.y[i]**2) - self.R_earth
            velocity = math.sqrt(self.vx[i]**2 + self.vy[i]**2)
            self.temperature.append(self.calculate_temperature(altitude, velocity))
        
        self.resultado = (f"Simulação de reentrada concluída. "
                         f"Altitude inicial: {self.altitude0/1000:.0f} km, "
                         f"Velocidade inicial: {self.velocity0/1000:.2f} km/s, "
                         f"Temperatura máxima: {max(self.temperature):.0f} K")
        
        return self
    
    def criar_animacao(self):
        if self.t is None:
            print("Erro: Execute a simulação primeiro")
            return

        fig = plt.figure(figsize=(14, 10))
        gs = plt.GridSpec(2, 2, figure=fig)
        ax_main = fig.add_subplot(gs[0, 0])
        ax_altitude = fig.add_subplot(gs[0, 1])
        ax_temperature = fig.add_subplot(gs[1, 0])
        ax_velocity = fig.add_subplot(gs[1, 1])
        
        # Plot principal
        ax_main.set_xlim(-200000, 200000)
        ax_main.set_ylim(self.R_earth - 100000, self.R_earth + 200000)
        ax_main.set_aspect('equal')
        ax_main.set_title('REENTRADA ATMOSFÉRICA', fontsize=14, fontweight='bold')
        ax_main.set_xlabel('Distância Horizontal (m)')
        ax_main.set_ylabel('Altitude (m)')
        ax_main.grid(True, alpha=0.3)
        
        # Terra
        earth = Circle((0, self.R_earth), self.R_earth, color='blue', alpha=0.3)
        ax_main.add_patch(earth)
        
        # Atmosfera
        for i in range(3):
            atm = Circle((0, self.R_earth), self.R_earth + (i+1)*50000, 
                        color='lightblue', alpha=0.1 - i*0.03, fill=False)
            ax_main.add_patch(atm)
        
        # Gráficos auxiliares
        ax_altitude.set_xlim(0, self.t_max)
        ax_altitude.set_ylim(0, self.altitude0 * 1.1)
        ax_altitude.set_title('ALTITUDE vs TEMPO')
        ax_altitude.set_ylabel('Altitude (m)')
        ax_altitude.grid(True, alpha=0.3)
        
        ax_temperature.set_xlim(0, self.t_max)
        ax_temperature.set_ylim(0, max(self.temperature) * 1.1 if self.temperature else 1000)
        ax_temperature.set_title('TEMPERATURA vs TEMPO')
        ax_temperature.set_ylabel('Temperatura (K)')
        ax_temperature.set_xlabel('Tempo (s)')
        ax_temperature.grid(True, alpha=0.3)
        
        ax_velocity.set_xlim(0, self.t_max)
        ax_velocity.set_ylim(0, self.velocity0 * 1.1)
        ax_velocity.set_title('VELOCIDADE vs TEMPO')
        ax_velocity.set_ylabel('Velocidade (m/s)')
        ax_velocity.set_xlabel('Tempo (s)')
        ax_velocity.grid(True, alpha=0.3)
        
        # Elementos animados
        capsule, = ax_main.plot([], [], 'ro', markersize=8, label='Cápsula')
        trajectory, = ax_main.plot([], [], 'r--', alpha=0.5)
        
        alt_line, = ax_altitude.plot([], [], 'b-')
        alt_point, = ax_altitude.plot([], [], 'ro')
        
        temp_line, = ax_temperature.plot([], [], 'r-')
        temp_point, = ax_temperature.plot([], [], 'ro')
        
        vel_line, = ax_velocity.plot([], [], 'g-')
        vel_point, = ax_velocity.plot([], [], 'ro')
        
        info_text = ax_main.text(0.02, 0.98, '', transform=ax_main.transAxes, 
                                fontsize=10, va='top')
        
        traj_x, traj_y = [], []
        alt_data, temp_data, vel_data, time_data = [], [], [], []
        
        def animate(frame):
            idx = min(frame * 2, len(self.t) - 1)  # Acelerar animação
            
            x, y = self.x[idx], self.y[idx]
            altitude = math.sqrt(x**2 + y**2) - self.R_earth
            velocity = math.sqrt(self.vx[idx]**2 + self.vy[idx]**2)
            temperature = self.temperature[idx] if idx < len(self.temperature) else 300
            
            # Cápsula
            capsule.set_data([x], [y])
            
            # Trajetória
            traj_x.append(x)
            traj_y.append(y)
            trajectory.set_data(traj_x, traj_y)
            
            # Gráficos
            current_time = self.t[idx]
            time_data.append(current_time)
            alt_data.append(altitude)
            temp_data.append(temperature)
            vel_data.append(velocity)
            
            alt_line.set_data(time_data, alt_data)
            alt_point.set_data([current_time], [altitude])
            temp_line.set_data(time_data, temp_data)
            temp_point.set_data([current_time], [temperature])
            vel_line.set_data(time_data, vel_data)
            vel_point.set_data([current_time], [velocity])
            
            # Informações
            info_text.set_text(f'Tempo: {current_time:.1f} s\n'
                             f'Altitude: {altitude/1000:.1f} km\n'
                             f'Velocidade: {velocity/1000:.2f} km/s\n'
                             f'Temperatura: {temperature:.0f} K')
            
            return (capsule, trajectory, alt_line, alt_point, 
                   temp_line, temp_point, vel_line, vel_point, info_text)
        
        total_frames = len(self.t) // 2
        anim = FuncAnimation(fig, animate, frames=total_frames, 
                           interval=50, blit=True, repeat=True)
        
        plt.tight_layout()
        print("Salvando animação de reentrada...")
        anim.save('reentrada_atmosferica.gif', writer='pillow', fps=20, dpi=100)
        plt.show()
        return anim

# Função para executar simulações individualmente
def executar_simulacao_foguete():
    print(" INICIANDO SIMULAÇÃO DE LANÇAMENTO DE FOGUETE")
    print("=" * 50)
    
    simulacao = RocketSimulation()
    simulacao.executarSimulacao()
    
    if simulacao.processarSimulacao():
        print(f" {simulacao.resultado}")
        print(" Gerando animação...")
        simulacao.criar_animacao()
        print(" GIF salvo como 'lancamento_foguete.gif'")
    else:
        print(" Falha na simulação")
    
    print("=" * 50)

def executar_simulacao_orbita():
    print(" INICIANDO SIMULAÇÃO DE ÓRBITA SATELITAL")
    print("=" * 50)
    
    simulacao = OrbitalSimulation()
    simulacao.executarSimulacao()
    
    if simulacao.processarSimulacao():
        print(f" {simulacao.resultado}")
        print(" Gerando animação...")
        simulacao.criar_animacao()
        print(" GIF salvo como 'orbita_satelite.gif'")
    else:
        print(" Falha na simulação")
    
    print("=" * 50)

def executar_simulacao_reentrada():
    print(" INICIANDO SIMULAÇÃO DE REENTRADA ATMOSFÉRICA")
    print("=" * 50)
    
    simulacao = ReentrySimulation()
    simulacao.executarSimulacao()
    
    if simulacao.processarSimulacao():
        print(f" {simulacao.resultado}")
        print(" Gerando animação...")
        simulacao.criar_animacao()
        print(" GIF salvo como 'reentrada_atmosferica.gif'")
    else:
        print(" Falha na simulação")
    
    print("=" * 50)

# Menu principal para escolher qual simulação executar
if __name__ == "__main__":
    print(" SISTEMA DE SIMULAÇÃO ESPACIAL COMPLETO")
    print("=" * 60)
    print("Escolha a simulação que deseja executar:")
    print("1.  Lançamento de Foguete")
    print("2.  Satélite em Órbita")
    print("3.  Reentrada Atmosférica")
    print("4.  Todas as Simulações")
    print("=" * 60)
    
    try:
        escolha = input("Digite o número da sua escolha (1-4): ").strip()
        
        if escolha == "1":
            executar_simulacao_foguete()
        elif escolha == "2":
            executar_simulacao_orbita()
        elif escolha == "3":
            executar_simulacao_reentrada()
        elif escolha == "4":
            print(" EXECUTANDO TODAS AS SIMULAÇÕES")
            print("=" * 50)
            executar_simulacao_foguete()
            executar_simulacao_orbita()
            executar_simulacao_reentrada()
        else:
            print(" Escolha inválida. Executando simulação padrão (Foguete)")
            executar_simulacao_foguete()
            
    except KeyboardInterrupt:
        print("\n⏹ Simulação interrompida pelo usuário")
    except Exception as e:
        print(f"Erro durante a execução: {e}")
    
    print("\n Simulação concluída!")
    print(" Arquivos GIF gerados:")
    print("   - lancamento_foguete.gif")
    print("   - orbita_satelite.gif") 
    print("   - reentrada_atmosferica.gif")