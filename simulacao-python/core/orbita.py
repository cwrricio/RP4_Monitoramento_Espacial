# core/orbita.py
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from matplotlib.patches import Circle
from .base import Simulacao
from .enums import TipoSimulacao
from utils.physics import PhysicsUtils
from utils.animation import AnimationUtils

class OrbitalSimulation(Simulacao):
    def __init__(self, descricao="Simulação de Satélite em Órbita"):
        super().__init__(descricao, TipoSimulacao.ORBITA)

        # Usar constantes do PhysicsUtils
        self.G = PhysicsUtils.G
        self.M = PhysicsUtils.M_EARTH
        self.R = PhysicsUtils.R_EARTH

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

    def orbital_derivatives(self, t, state_vec):
        """Calcula as derivadas para o sistema orbital usando PhysicsUtils"""
        x, y, vx, vy = state_vec
        r = np.sqrt(x**2 + y**2)
        
        # Evita divisão por zero
        if r < self.R:
            r = self.R
            
        # Usar utilitário de física para aceleração gravitacional
        g_mag = PhysicsUtils.gravidade(r - self.R)  # altitude = r - R_earth
        factor = -g_mag / r  # Componente radial
        
        ax = factor * x
        ay = factor * y
        
        return np.array([vx, vy, ax, ay])

    def executarSimulacao(self):
        """Executa a simulação orbital usando método RK4 do PhysicsUtils"""
        print("Executando simulação orbital com método RK4...")
        
        # Notificar início da simulação
        self.notify_simulation_update({
            'status': 'INICIANDO',
            'message': 'Simulação orbital iniciada',
            'step': 0,
            'total_steps': int(self.t_max / self.dt)
        })
        
        # Condições iniciais usando PhysicsUtils
        r0 = self.R + self.h
        v0 = PhysicsUtils.velocidade_orbital(self.h)  # Velocidade orbital calculada

        # Estado inicial: [x, y, vx, vy]
        state = np.array([r0, 0.0, 0.0, v0])
        
        n_steps = int(self.t_max / self.dt)
        positions = np.zeros((n_steps, 2))
        velocities = np.zeros((n_steps, 2))
        altitudes = np.zeros(n_steps)
        times = np.zeros(n_steps)

        # Integração temporal com RK4 do PhysicsUtils
        for i in range(n_steps):
            times[i] = i * self.dt
            
            # Usar RK4 do PhysicsUtils
            state = PhysicsUtils.integracao_rk4(
                self.orbital_derivatives, times[i], state, self.dt
            )

            # Armazena resultados
            positions[i] = state[0:2]
            velocities[i] = state[2:4]
            altitudes[i] = np.linalg.norm(state[0:2]) - self.R

            # Notificar progresso a cada 50 passos
            if i % 50 == 0:
                self.notify_simulation_update({
                    'status': 'EXECUTANDO',
                    'step': i,
                    'total_steps': n_steps,
                    'progresso': (i / n_steps) * 100,
                    'altitude_atual': float(altitudes[i]),
                    'velocidade_atual': float(np.linalg.norm(velocities[i])),
                    'tempo_atual': float(times[i])
                })
                
                # Verificar condições de emergência
                self._verificar_emergencias(i, altitudes, velocities, times)

        self.positions = positions
        self.velocities = velocities
        self.altitudes = altitudes
        self.times = times
        
        print(f"Simulação RK4 concluída: {n_steps} passos, {self.t_max/60:.1f} minutos simulados")
        
        # Processa automaticamente após executar
        self.processarSimulacao()
        return self

    def _verificar_emergencias(self, step_index, altitudes, velocities, times):
        """Verifica condições de emergência durante a simulação orbital"""
        if not self._emergency_observers:
            return
            
        if step_index >= len(altitudes) or step_index >= len(velocities):
            return
            
        altitude = altitudes[step_index]
        velocidade = np.linalg.norm(velocities[step_index])
        tempo = times[step_index]
        
        # Condições de emergência orbital usando PhysicsUtils
        v_orbital_teorica = PhysicsUtils.velocidade_orbital(altitude)
        v_escape = PhysicsUtils.velocidade_escape(altitude)
        
        # Órbita muito baixa (risco de reentrada)
        if altitude < 150000:  
            self.notify_emergency("ORBITA_BAIXA", {
                'tempo': float(tempo),
                'altitude': float(altitude),
                'velocidade': float(velocidade),
                'altitude_minima_segura': 200000,
                'velocidade_orbital_teorica': float(v_orbital_teorica),
                'severidade': 'ALTA'
            })
        
        # Órbita muito alta (risco de escape)
        if altitude > 400000 and velocidade > v_escape * 0.8:
            self.notify_emergency("ORBITA_ALTA", {
                'tempo': float(tempo),
                'altitude': float(altitude),
                'velocidade': float(velocidade),
                'velocidade_escape': float(v_escape),
                'severidade': 'MEDIA'
            })
        
        # Verificar variação excessiva de altitude (órbita instável)
        if step_index > 10:
            alt_variation = np.std(altitudes[max(0, step_index-10):step_index])
            if alt_variation > 50000:  # Variação maior que 50km
                self.notify_emergency("ORBITA_INSTAVEL", {
                    'tempo': float(tempo),
                    'variacao_altitude': float(alt_variation),
                    'severidade': 'ALTA'
                })

    def processarSimulacao(self):
        """Processa os resultados calculando parâmetros orbitais com PhysicsUtils"""
        try:
            if self.positions is None:
                self.resultado = "Erro: Simulação não foi executada."
                return False

            # Cálculos de parâmetros orbitais usando PhysicsUtils
            pos_norms = np.linalg.norm(self.positions, axis=1)
            vel_norms = np.linalg.norm(self.velocities, axis=1)
            
            orbital_radius = np.mean(pos_norms)
            orbital_period = PhysicsUtils.periodo_orbital(orbital_radius - self.R)
            orbital_velocity = PhysicsUtils.velocidade_orbital(orbital_radius - self.R)
            altitude_media = orbital_radius - self.R
            
            # Calcula número de órbitas completas
            orbitas_completas = self.t_max / orbital_period
            
            # Energia orbital usando PhysicsUtils
            energies = [PhysicsUtils.energia_orbital(alt, vel) 
                       for alt, vel in zip(self.altitudes, vel_norms)]
            energy_conservation = np.std(energies) / np.mean(np.abs(energies))
            
            # Excentricidade usando PhysicsUtils
            eccentricities = [PhysicsUtils.excentricidade_orbital(alt, vel)
                             for alt, vel in zip(self.altitudes, vel_norms)]
            eccentricity_mean = np.mean(eccentricities)

            self.resultado = f"""
RESULTADOS DA SIMULAÇÃO ORBITAL
===================================
• Tipo: {self.tipo.value}
• Altitude média: {altitude_media/1000:.2f} km
• Período orbital: {orbital_period:.2f} s ({orbital_period/60:.2f} min)
• Velocidade orbital: {orbital_velocity:.2f} m/s
• Velocidade de escape: {PhysicsUtils.velocidade_escape(altitude_media):.2f} m/s
• Órbitas simuladas: {orbitas_completas:.2f}
• Excentricidade média: {eccentricity_mean:.4f}
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
            
            # Chamar o processamento da classe base
            return super().processarSimulacao()
            
        except Exception as e:
            self.resultado = f"Erro no processamento: {e}"
            import traceback
            print(f"Detalhes do erro: {traceback.format_exc()}")
            return False

    def criar_animacao(self):
        """Cria animação orbital usando AnimationUtils"""
        if self.positions is None:
            print("Execute a simulação primeiro.")
            return None

        print("Criando animação orbital...")
        
        # Notificar início da animação
        self.notify_simulation_update({
            'status': 'ANIMACAO_INICIADA',
            'message': 'Criando animação orbital'
        })
        
        # Usar utilitário de animação orbital
        ani = AnimationUtils.criar_animacao_orbita(
            self.positions, self.times, "SIMULAÇÃO ORBITAL - SATÉLITE EM ÓRBITA TERRESTRE"
        )
        
        # Notificar conclusão da animação
        self.notify_simulation_update({
            'status': 'ANIMACAO_CONCLUIDA',
            'message': 'Animação orbital criada com sucesso'
        })
        
        print("Animação criada com sucesso!")
        plt.show()
        return ani

    def criar_animacao_detalhada(self):
        """Cria uma animação detalhada da órbita com múltiplos gráficos"""
        if self.positions is None:
            print("Execute a simulação primeiro.")
            return None

        print("Criando animação orbital detalhada...")
        
        # Notificar início da animação
        self.notify_simulation_update({
            'status': 'ANIMACAO_INICIADA',
            'message': 'Criando animação orbital detalhada'
        })
        
        # Preparar dados para animação
        tempos_min = self.times / 60
        velocidades = np.linalg.norm(self.velocities, axis=1)
        altitudes_km = self.altitudes / 1000
        
        # Calcular acelerações
        aceleracoes = []
        for i in range(1, len(velocidades)):
            dv = velocidades[i] - velocidades[i-1]
            dt = self.times[i] - self.times[i-1]
            if dt > 0:
                aceleracoes.append(dv / dt)
            else:
                aceleracoes.append(0)
        aceleracoes = np.array(aceleracoes)
        
        # Criar painel multigráfico
        datasets = [
            altitudes_km,
            velocidades,
            np.abs(aceleracoes) if len(aceleracoes) > 0 else np.zeros(len(tempos_min)-1),
            [PhysicsUtils.energia_orbital(alt, vel) for alt, vel in zip(self.altitudes, velocidades)]
        ]
        
        titles = [
            'Altitude vs Tempo',
            'Velocidade vs Tempo', 
            'Aceleração vs Tempo',
            'Energia Orbital vs Tempo'
        ]
        
        ani = AnimationUtils.criar_painel_multigrafico(
            tempos_min, datasets, titles, layout=(2, 2), figsize=(15, 10)
        )
        
        # Notificar conclusão da animação
        self.notify_simulation_update({
            'status': 'ANIMACAO_CONCLUIDA',
            'message': 'Animação detalhada criada com sucesso'
        })
        
        plt.show()
        return ani

    def plotar_trajetoria_simples(self):
        """Plota uma visualização simples da trajetória orbital"""
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

    def _obter_resultados_json(self):
        """Resultados específicos para órbita em formato JSON"""
        resultados = super()._obter_resultados_json()
        
        # Adiciona métricas calculadas específicas da órbita
        if self.positions is not None and self.velocities is not None:
            pos_norms = np.linalg.norm(self.positions, axis=1)
            vel_norms = np.linalg.norm(self.velocities, axis=1)
            
            orbital_radius = np.mean(pos_norms)
            orbital_period = PhysicsUtils.periodo_orbital(orbital_radius - self.R)
            orbital_velocity = PhysicsUtils.velocidade_orbital(orbital_radius - self.R)
            altitude_media = (orbital_radius - self.R) / 1000
            
            # Energia orbital
            energies = [PhysicsUtils.energia_orbital(alt, vel) 
                       for alt, vel in zip(self.altitudes, vel_norms)]
            energy_conservation = np.std(energies) / np.mean(np.abs(energies))
            
            # Excentricidade
            eccentricities = [PhysicsUtils.excentricidade_orbital(alt, vel)
                             for alt, vel in zip(self.altitudes, vel_norms)]
            eccentricity_mean = np.mean(eccentricities)
            
            resultados.update({
                'orbital_radius': float(orbital_radius),
                'orbital_period': float(orbital_period),
                'orbital_velocity': float(orbital_velocity),
                'mean_altitude_km': float(altitude_media),
                'energy_conservation': float(energy_conservation),
                'eccentricity': float(eccentricity_mean),
                'orbits_completed': float(self.t_max / orbital_period),
                'initial_altitude_km': float(self.h / 1000),
                'escape_velocity': float(PhysicsUtils.velocidade_escape(orbital_radius - self.R))
            })
        
        return resultados