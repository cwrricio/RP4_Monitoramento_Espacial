import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp
from matplotlib.animation import FuncAnimation
from matplotlib.patches import Rectangle
from .base import Simulacao
from .enums import TipoSimulacao
from utils.physics import PhysicsUtils
from utils.animation import AnimationUtils

class RocketSimulation(Simulacao):
    def __init__(self, descricao="Simulação de Lançamento de Foguete"):
        super().__init__(descricao, TipoSimulacao.FOGUETE)
        self.thrust = 7607000
        self.m0 = 549000
        self.m_propellant = 507000
        self.burn_time = 180
        self.cd = 0.5
        self.area = 10
        self.g = PhysicsUtils.G0
        self.rho0 = PhysicsUtils.RHO0
        self.H = PhysicsUtils.H_ATMOSPHERE
        self.t_max = 600
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
        
        # Usar utilitário de física para densidade do ar
        rho = PhysicsUtils.densidade_ar(y)
        drag = PhysicsUtils.forca_arrasto(v, rho, self.cd, self.area)
        
        dvdt = (thrust - drag - m * self.g) / m
        return [v, dvdt]

    def executarSimulacao(self):
        print("Executando simulação de lançamento de foguete...")
        
        # Notificar início da simulação
        self.notify_simulation_update({
            'status': 'INICIANDO',
            'message': 'Simulação de foguete iniciada',
            'step': 0,
            'total_steps': 2000
        })
        
        t_eval = np.linspace(0, self.t_max, 2000)
        sol = solve_ivp(self.equations_of_motion, [0, self.t_max], [0, 0], 
                       t_eval=t_eval, method='RK45')
        self.t, self.y, self.v = sol.t, sol.y[0], sol.y[1]
        
        # Notificar progresso durante a simulação
        for i in range(0, len(self.t), 100):
            self.notify_simulation_update({
                'status': 'EXECUTANDO',
                'step': i,
                'total_steps': len(self.t),
                'progresso': (i / len(self.t)) * 100,
                'altitude_atual': float(self.y[i]),
                'velocidade_atual': float(self.v[i]),
                'tempo_atual': float(self.t[i])
            })
            
            # Verificar condições de emergência
            self._verificar_emergencias(i)
        
        # Processa automaticamente após executar
        self.processarSimulacao()
        return self

    def _verificar_emergencias(self, step_index):
        """Verifica condições de emergência durante a simulação"""
        if not self._emergency_observers:
            return
            
        if step_index >= len(self.t) or step_index >= len(self.y) or step_index >= len(self.v):
            return
            
        altitude = self.y[step_index]
        velocidade = self.v[step_index]
        tempo = self.t[step_index]
        massa = self.mass(tempo)
        
        # Condições de emergência
        if velocidade > 4000:  # Velocidade crítica
            self.notify_emergency("VELOCIDADE_CRITICA", {
                'tempo': float(tempo),
                'velocidade': float(velocidade),
                'altitude': float(altitude),
                'massa': float(massa),
                'severidade': 'ALTA'
            })
        
        if tempo < self.burn_time and massa < self.m0 * 0.1:  # Combustível muito baixo
            self.notify_emergency("COMBUSTIVEL_CRITICO", {
                'tempo': float(tempo),
                'massa_combustivel': float(massa - (self.m0 - self.m_propellant)),
                'massa_total': float(massa),
                'percentual_combustivel': ((massa - (self.m0 - self.m_propellant)) / self.m_propellant) * 100,
                'severidade': 'MEDIA'
            })
        
        if altitude > 100000 and velocidade < 1000:  # Falha em alcançar órbita
            self.notify_emergency("FALHA_ORBITAL", {
                'tempo': float(tempo),
                'altitude': float(altitude),
                'velocidade': float(velocidade),
                'velocidade_orbital_necessaria': PhysicsUtils.velocidade_orbital(altitude),
                'severidade': 'ALTA'
            })

    def processarSimulacao(self):
        try:
            if self.y is None or self.v is None:
                self.resultado = "Erro: Simulação não foi executada."
                return False
            
            max_altitude = np.max(self.y)
            max_velocity = np.max(self.v)
            burnout_index = np.argmax(self.t >= self.burn_time)
            burnout_altitude = self.y[burnout_index] if burnout_index < len(self.y) else self.y[-1]
            burnout_velocity = self.v[burnout_index] if burnout_index < len(self.v) else self.v[-1]
            
            # Calcula aceleração
            acceleration = np.diff(self.v) / np.diff(self.t)
            max_acceleration = np.max(np.abs(acceleration))
            
            # Calcular velocidade orbital teórica
            v_orbital = PhysicsUtils.velocidade_orbital(max_altitude)
            
            self.resultado = f"""
RESULTADOS DA SIMULAÇÃO DE FOGUETE:
----------------------------------------
• Tipo: {self.tipo.value}
• Altitude máxima: {max_altitude:.2f} m
• Velocidade máxima: {max_velocity:.2f} m/s
• Velocidade orbital teórica: {v_orbital:.2f} m/s
• Altitude no burnout: {burnout_altitude:.2f} m
• Velocidade no burnout: {burnout_velocity:.2f} m/s
• Aceleração máxima: {max_acceleration/9.81:.2f} G
• Tempo de queima: {self.burn_time} s
• Data da simulação: {self.dataExecucao.strftime('%Y-%m-%d %H:%M:%S')}
"""
            # Chamar o processamento da classe base
            return super().processarSimulacao()
            
        except Exception as e:
            self.resultado = f"Erro no processamento: {e}"
            return False

    def criar_animacao(self):
        """Cria animação do lançamento do foguete usando AnimationUtils"""
        print("Criando animação do foguete...")
        if self.y is None:
            print("Erro: Execute a simulação primeiro.")
            return
        
        # Notificar início da animação
        self.notify_simulation_update({
            'status': 'ANIMACAO_INICIADA',
            'message': 'Criando animação do lançamento'
        })
        
        # Usar utilitário de animação
        ani = AnimationUtils.criar_animacao_padrao(
            self.t, self.y, 
            "ALTITUDE DO FOGUETE VS TEMPO",
            "Tempo (s)", 
            "Altitude (m)",
            interval=30
        )
        
        # Notificar conclusão da animação
        self.notify_simulation_update({
            'status': 'ANIMACAO_CONCLUIDA',
            'message': 'Animação criada com sucesso',
            'total_frames': len(self.t)
        })
        
        plt.show()
        return ani

    def criar_animacao_detalhada(self):
        """Cria animação detalhada com múltiplos gráficos"""
        if self.y is None or self.v is None:
            print("Erro: Execute a simulação primeiro.")
            return
        
        # Calcular aceleração
        acceleration = np.diff(self.v) / np.diff(self.t)
        acceleration_g = np.abs(acceleration) / 9.81
        
        # Usar painel multigráfico
        datasets = [self.y, np.abs(self.v), acceleration_g, self.v**2/(2*9.81)]  # Energia cinética equivalente
        titles = ['Altitude vs Tempo', 'Velocidade vs Tempo', 'Aceleração vs Tempo', 'Energia Cinética vs Tempo']
        
        ani = AnimationUtils.criar_painel_multigrafico(
            self.t, datasets, titles, layout=(2, 2), figsize=(15, 10)
        )
        
        plt.show()
        return ani

    def _obter_resultados_json(self):
        """Resultados específicos para foguete"""
        resultados = super()._obter_resultados_json()
        
        # Adiciona métricas calculadas
        if self.y is not None and self.v is not None:
            max_altitude = np.max(self.y)
            max_velocity = np.max(self.v)
            burnout_index = np.argmax(self.t >= self.burn_time)
            burnout_altitude = self.y[burnout_index] if burnout_index < len(self.y) else self.y[-1]
            burnout_velocity = self.v[burnout_index] if burnout_index < len(self.v) else self.v[-1]
            acceleration = np.diff(self.v) / np.diff(self.t)
            max_acceleration = np.max(np.abs(acceleration))
            
            # Cálculos com PhysicsUtils
            v_orbital = PhysicsUtils.velocidade_orbital(max_altitude)
            v_escape = PhysicsUtils.velocidade_escape(max_altitude)
            
            resultados.update({
                'max_altitude': float(max_altitude),
                'max_velocity': float(max_velocity),
                'burnout_altitude': float(burnout_altitude),
                'burnout_velocity': float(burnout_velocity),
                'max_acceleration_g': float(max_acceleration/9.81),
                'orbital_velocity': float(v_orbital),
                'escape_velocity': float(v_escape),
                'reached_orbit': float(max_velocity) >= v_orbital * 0.9
            })
        
        return resultados