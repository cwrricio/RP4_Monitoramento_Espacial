import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import numpy as np

class AnimationUtils:
    """Utilitários para criação de animações"""
    
    @staticmethod
    def criar_animacao_padrao(times, values, title, xlabel, ylabel, interval=30):
        """
        Cria uma animação padrão para dados temporais
        
        Args:
            times: array de tempos
            values: array de valores
            title: título do gráfico
            xlabel: label do eixo x
            ylabel: label do eixo y
            interval: intervalo entre frames (ms)
        """
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Configuração inicial
        ax.set_xlim(0, np.max(times))
        ax.set_ylim(np.min(values) * 0.95, np.max(values) * 1.05)
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
        ax.grid(True, alpha=0.3)
        
        # Elementos da animação
        line, = ax.plot([], [], 'b-', linewidth=2)
        point, = ax.plot([], [], 'ro', markersize=8)
        
        # Texto informativo
        info_text = ax.text(0.02, 0.98, "", transform=ax.transAxes, fontsize=10,
                          verticalalignment='top', bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
        
        def init():
            line.set_data([], [])
            point.set_data([], [])
            info_text.set_text("")
            return line, point, info_text
        
        def animate(i):
            line.set_data(times[:i+1], values[:i+1])
            point.set_data([times[i]], [values[i]])
            info_text.set_text(f"Tempo: {times[i]:.1f} s\nValor: {values[i]:.1f}")
            return line, point, info_text
        
        ani = FuncAnimation(fig, animate, frames=len(times),
                          init_func=init, interval=interval, blit=True, repeat=True)
        
        plt.tight_layout()
        return ani
    
    @staticmethod
    def criar_animacao_orbita(positions, times, title="Simulação Orbital"):
        """
        Cria animação para trajetória orbital 2D
        
        Args:
            positions: array de posições [x, y]
            times: array de tempos
            title: título da animação
        """
        fig, ax = plt.subplots(figsize=(10, 10))
        
        # Calcular limites do gráfico
        max_range = 1.3 * np.max(np.linalg.norm(positions, axis=1))
        ax.set_xlim(-max_range, max_range)
        ax.set_ylim(-max_range, max_range)
        ax.set_aspect('equal')
        ax.set_title(title, fontsize=16, fontweight='bold')
        ax.set_xlabel("Posição X (m)")
        ax.set_ylabel("Posição Y (m)")
        ax.grid(True, alpha=0.3)
        
        # Terra
        from matplotlib.patches import Circle
        terra = Circle((0, 0), 6.371e6, color='blue', alpha=0.6, label='Terra')
        ax.add_patch(terra)
        
        # Elementos da animação
        satelite, = ax.plot([], [], 'ro', markersize=8, markeredgecolor='darkred', 
                           markerfacecolor='red', label='Satélite')
        trajetoria, = ax.plot([], [], 'r-', alpha=0.6, linewidth=2, label='Trajetória')
        
        ax.legend(loc='upper right')
        
        # Texto informativo
        info_text = ax.text(0.02, 0.98, "", transform=ax.transAxes, fontsize=11,
                          verticalalignment='top', bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
        
        def init():
            satelite.set_data([], [])
            trajetoria.set_data([], [])
            info_text.set_text("")
            return satelite, trajetoria, info_text
        
        def animate(i):
            x, y = positions[i]
            satelite.set_data([x], [y])
            
            # Mostrar apenas os últimos 20% da trajetória para performance
            start_idx = max(0, i - len(positions) // 5)
            trajetoria.set_data(positions[start_idx:i+1, 0], positions[start_idx:i+1, 1])
            
            info_text.set_text(f"Tempo: {times[i]:.1f} s\n"
                             f"Posição: ({x:.0f}, {y:.0f}) m\n"
                             f"Altitude: {np.linalg.norm(positions[i]) - 6.371e6:.0f} m")
            
            return satelite, trajetoria, info_text
        
        ani = FuncAnimation(fig, animate, frames=len(positions),
                          init_func=init, interval=50, blit=True, repeat=True)
        
        plt.tight_layout()
        return ani
    
    @staticmethod
    def criar_animacao_reentrada(altitudes, velocities, times, title="Reentrada Atmosférica"):
        """
        Cria animação para reentrada atmosférica
        
        Args:
            altitudes: array de altitudes
            velocities: array de velocidades
            times: array de tempos
            title: título da animação
        """
        fig, ax = plt.subplots(figsize=(12, 8))
        
        # Configuração do gráfico
        ax.set_xlim(-2, 2)
        ax.set_ylim(-5000, np.max(altitudes) * 1.1)
        ax.set_title(title, fontsize=16, fontweight='bold')
        ax.set_xlabel("Direção (m)")
        ax.set_ylabel("Altitude (m)")
        ax.grid(True, alpha=0.3)
        
        # Camadas atmosféricas
        max_alt = np.max(altitudes)
        ax.axhspan(80000, max_alt, alpha=0.1, color='black', label='Espaço')
        ax.axhspan(40000, 80000, alpha=0.1, color='darkblue', label='Alta Atmosfera')
        ax.axhspan(10000, 40000, alpha=0.1, color='blue', label='Atmosfera Média')
        ax.axhspan(0, 10000, alpha=0.1, color='lightblue', label='Baixa Atmosfera')
        
        # Solo
        from matplotlib.patches import Rectangle
        ground = Rectangle((-10, -5000), 20, 5000, color='brown', alpha=0.7, label='Superfície')
        ax.add_patch(ground)
        
        # Elementos da animação
        capsule, = ax.plot([], [], 'ro', markersize=12, markeredgecolor='darkred', 
                          markerfacecolor='red', label='Cápsula')
        plasma_trail, = ax.plot([], [], 'y-', linewidth=3, alpha=0.7, label='Esteira de Plasma')
        trajectory, = ax.plot([], [], 'r--', alpha=0.5, linewidth=1, label='Trajetória')
        
        ax.legend(loc='upper left')
        
        # Texto informativo
        info_text = ax.text(0.98, 0.98, "", transform=ax.transAxes, fontsize=10,
                          verticalalignment='top', horizontalalignment='right',
                          bbox=dict(boxstyle='round', facecolor='white', alpha=0.9))
        
        def init():
            capsule.set_data([], [])
            plasma_trail.set_data([], [])
            trajectory.set_data([], [])
            info_text.set_text("")
            return capsule, plasma_trail, trajectory, info_text
        
        def animate(i):
            current_altitude = altitudes[i]
            current_velocity = velocities[i]
            current_time = times[i]
            
            # Cápsula
            capsule.set_data([0], [current_altitude])
            
            # Esteira de plasma
            if abs(current_velocity) > 2000 and current_altitude > 50000:
                trail_length = min(1000, abs(current_velocity) * 0.1)
                plasma_trail.set_data([0, 0], [current_altitude, current_altitude + trail_length])
                plasma_trail.set_alpha(0.8)
            elif abs(current_velocity) > 1000:
                plasma_trail.set_data([0, 0], [current_altitude, current_altitude + 500])
                plasma_trail.set_alpha(0.6)
            else:
                plasma_trail.set_data([], [])
            
            # Trajetória
            start_idx = max(0, i - 100)
            trajectory.set_data(np.zeros(i - start_idx + 1), altitudes[start_idx:i+1])
            
            # Informações
            phase = "FASE INICIAL" if current_altitude > 80000 else \
                   "REENTRADA CRÍTICA" if current_altitude > 40000 else \
                   "FASE FINAL" if current_altitude > 10000 else "QUASE TERRA"
            
            temp = 300 + (abs(current_velocity)**3 * 1e-9)
            
            info_text.set_text(
                f"Tempo: {current_time:.1f} s\n"
                f"Altitude: {current_altitude:.0f} m\n"
                f"Velocidade: {abs(current_velocity):.0f} m/s\n"
                f"Temperatura: {temp:.0f} K\n"
                f"Fase: {phase}"
            )
            
            return capsule, plasma_trail, trajectory, info_text
        
        ani = FuncAnimation(fig, animate, frames=len(altitudes),
                          init_func=init, interval=30, blit=True, repeat=True)
        
        plt.tight_layout()
        return ani
    
    @staticmethod
    def criar_painel_multigrafico(times, datasets, titles, layout=(2, 2), figsize=(15, 10)):
        """
        Cria um painel com múltiplos gráficos animados
        
        Args:
            times: array de tempos
            datasets: lista de arrays de dados
            titles: lista de títulos
            layout: layout dos subplots (linhas, colunas)
            figsize: tamanho da figura
        """
        fig, axes = plt.subplots(layout[0], layout[1], figsize=figsize)
        axes = axes.flatten() if hasattr(axes, 'flatten') else [axes]
        
        lines = []
        points = []
        info_texts = []
        
        # Inicializar cada subplot
        for idx, (ax, data, title) in enumerate(zip(axes, datasets, titles)):
            ax.set_xlim(0, np.max(times))
            ax.set_ylim(np.min(data) * 0.95, np.max(data) * 1.05)
            ax.set_title(title, fontsize=12, fontweight='bold')
            ax.set_xlabel('Tempo (s)')
            ax.grid(True, alpha=0.3)
            
            line, = ax.plot([], [], 'b-', linewidth=2)
            point, = ax.plot([], [], 'ro', markersize=6)
            info_text = ax.text(0.02, 0.98, "", transform=ax.transAxes, fontsize=9,
                              verticalalignment='top')
            
            lines.append(line)
            points.append(point)
            info_texts.append(info_text)
        
        def init():
            for line, point, info_text in zip(lines, points, info_texts):
                line.set_data([], [])
                point.set_data([], [])
                info_text.set_text("")
            return lines + points + info_texts
        
        def animate(i):
            for idx, (line, point, info_text, data) in enumerate(zip(lines, points, info_texts, datasets)):
                line.set_data(times[:i+1], data[:i+1])
                point.set_data([times[i]], [data[i]])
                info_text.set_text(f"t={times[i]:.1f}s\nv={data[i]:.1f}")
            
            return lines + points + info_texts
        
        ani = FuncAnimation(fig, animate, frames=len(times),
                          init_func=init, interval=40, blit=True, repeat=True)
        
        plt.tight_layout()
        return ani