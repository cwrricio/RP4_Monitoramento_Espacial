import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from scipy.integrate import solve_ivp
import matplotlib.patches as patches
import json
from datetime import datetime, date
from enum import Enum

class TipoSimulacao(Enum):
    FOGUETE = "Foguete"
    OUTRO = "Outro"

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
        """Processa a simulação e retorna se foi bem-sucedida"""
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
        
        # Resultados da simulação
        self.t = None
        self.y = None
        self.v = None
        
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
    
    def executarSimulacao(self):
        """Executa a simulação - implementação do método da classe base"""
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
        
        self.t = solution.t
        self.y = solution.y[0]
        self.v = solution.y[1]
        
        # Atualizar resultado
        burnout_index = np.where(self.t >= self.burn_time)[0][0]
        apogee_index = np.argmax(self.y)
        
        self.resultado = (f"Simulação de foguete concluída. "
                         f"Apogeu: {self.y[apogee_index]/1000:.2f} km, "
                         f"Velocidade máxima: {np.max(self.v)/1000:.2f} km/s")
        
        return self
    
    def processarSimulacao(self):
        """Processa os resultados da simulação"""
        try:
            if self.t is None or self.y is None or self.v is None:
                self.resultado = "Erro: Simulação não executada"
                return False
                
            # Aqui poderiam ser adicionadas análises mais complexas
            self.save_results_to_json()
            return True
        except Exception as e:
            self.resultado = f"Erro no processamento: {str(e)}"
            return False
    
    def save_results_to_json(self, filename="resultado_simulacao.json"):
        """Salva os resultados em JSON"""
        data = {
            "descricao": self.descricao,
            "tipo": self.tipo.value,
            "resultado": self.resultado,
            "dataExecucao": self.dataExecucao.isoformat(),
            "dados": {
                "tempo": self.t.tolist(),
                "altitude": self.y.tolist(),
                "velocidade": self.v.tolist()
            }
        }
        with open(filename, "w") as f:
            json.dump(data, f, indent=4)
    
    def plot_results(self):
        """Plota os resultados da simulação"""
        if self.t is None or self.y is None or self.v is None:
            print("Erro: Execute a simulação primeiro")
            return
            
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(14, 10))
        
        # Altitude vs Tempo
        ax1.plot(self.t, self.y / 1000, 'b-', linewidth=2)
        ax1.set_xlabel('Tempo (s)', fontsize=12)
        ax1.set_ylabel('Altitude (km)', fontsize=12)
        ax1.set_title('Altitude do Foguete', fontsize=14, fontweight='bold')
        ax1.grid(True, alpha=0.3)
        ax1.tick_params(axis='both', which='major', labelsize=10)
        
        # Destacar eventos importantes
        burnout_idx = np.where(self.t >= self.burn_time)[0][0]
        apogee_idx = np.argmax(self.y)
        ax1.axvline(x=self.t[burnout_idx], color='r', linestyle='--', alpha=0.7, label='Fim da queima')
        ax1.axvline(x=self.t[apogee_idx], color='g', linestyle='--', alpha=0.7, label='Apogeu')
        ax1.legend()
        
        # Velocidade vs Tempo
        ax2.plot(self.t, self.v / 1000, 'r-', linewidth=2)
        ax2.set_xlabel('Tempo (s)', fontsize=12)
        ax2.set_ylabel('Velocidade (km/s)', fontsize=12)
        ax2.set_title('Velocidade do Foguete', fontsize=14, fontweight='bold')
        ax2.grid(True, alpha=0.3)
        ax2.tick_params(axis='both', which='major', labelsize=10)
        
        # Aceleração vs Tempo
        acceleration = np.gradient(self.v, self.t)
        ax3.plot(self.t, acceleration / 9.81, 'purple', linewidth=2)
        ax3.set_xlabel('Tempo (s)', fontsize=12)
        ax3.set_ylabel('Aceleração (g)', fontsize=12)
        ax3.set_title('Aceleração do Foguete', fontsize=14, fontweight='bold')
        ax3.grid(True, alpha=0.3)
        ax3.tick_params(axis='both', which='major', labelsize=10)
        
        # Massa vs Tempo
        mass = np.array([self.mass(time) for time in self.t])
        ax4.plot(self.t, mass / 1000, 'orange', linewidth=2)
        ax4.set_xlabel('Tempo (s)', fontsize=12)
        ax4.set_ylabel('Massa (toneladas)', fontsize=12)
        ax4.set_title('Massa do Foguete', fontsize=14, fontweight='bold')
        ax4.grid(True, alpha=0.3)
        ax4.tick_params(axis='both', which='major', labelsize=10)
        
        plt.tight_layout()
        plt.savefig('rocket_simulation_detailed.png', dpi=300, bbox_inches='tight')
        plt.show()

class ProtocoloEmergencial:
    def __init__(self, nome, nivelGravidade, descricao):
        self.nome = nome
        self.nivelGravidade = nivelGravidade
        self.descricao = descricao
        self.ativo = False
    
    def ativarProtocolo(self):
        """Ativa o protocolo de emergência"""
        self.ativo = True
        return f"Protocolo {self.nome} ativado. Gravidade: {self.nivelGravidade.value}"
    
    def verificarStatus(self):
        """Verifica o status do protocolo"""
        return self.ativo

class EventoEmergencia:
    def __init__(self, descricao, dataDeteccao=None):
        self.descricao = descricao
        self.dataDeteccao = dataDeteccao if dataDeteccao else datetime.now()
        self.resolvido = False
        self.protocolos = []
    
    def RegistrarEventoEmergencia(self, gravidade):
        """Registra um evento de emergência e retorna o objeto criado"""
        
       
        if gravidade == 1:
            protocolo = ProtocoloEmergencial("Protocolo Baixo", Gravidade.BAIXA, 
                                           "Procedimento para emergências de baixa gravidade")
        elif gravidade == 2:
            protocolo = ProtocoloEmergencial("Protocolo Médio", Gravidade.MEDIA, 
                                           "Procedimento para emergências de média gravidade")
        else:
            protocolo = ProtocoloEmergencial("Protocolo Alto", Gravidade.ALTA, 
                                           "Procedimento para emergências de alta gravidade")
        
        self.protocolos.append(protocolo)
        return self

# Função para criar simulação (como especificado no diagrama)
def CriarSimulacao():
    """Cria uma nova simulação - implementação da função do diagrama"""
    return RocketSimulation()

# Executar a simulação
if __name__ == "__main__":
    print("Iniciando sistema de simulação...")
    
    # Criar simulação usando a função definida no diagrama
    simulacao = CriarSimulacao()
    print(f"Simulação criada: {simulacao.descricao}")
    
    # Executar a simulação
    simulacao.executarSimulacao()
    print("Simulação executada")
    
    # Processar resultados
    if simulacao.processarSimulacao():
        print("Simulação processada com sucesso")
        print(f"Resultado: {simulacao.resultado}")
    else:
        print("Falha no processamento da simulação")
    
    # Demonstrar funcionalidade de emergência
    print("\n--- Demonstração do Sistema de Emergência ---")
    
    # Criar evento de emergência
    evento = EventoEmergencia("Falha no sistema de navegação")
    evento.RegistrarEventoEmergencia(2)  # Gravidade média
    
    # Ativar protocolos de emergência (após detecção do evento)
    for protocolo in evento.protocolos:
        if not evento.resolvido:  # Só ativar se evento não resolvido
            mensagem = protocolo.ativarProtocolo()
            print(mensagem)
            print(f"Protocolo ativo: {protocolo.verificarStatus()}")
    
    # Mostrar gráficos
    print("\nGerando gráficos detalhados...")
    simulacao.plot_results()
    
    print("Sistema de simulação concluído!")