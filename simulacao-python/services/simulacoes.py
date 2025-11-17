# services/simulacoes.py
import sys
import os


print("=== DEBUG DETALHADO ===")


# Configurar caminhos
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, project_root)


# Importacoes
try:
    from core.foguete import RocketSimulation
    from core.orbita import OrbitalSimulation
   
    # Tenta importar reentrada
    try:
        from core.reentrada import ReentrySimulation
        REENTRY_AVAILABLE = True
        print("ReentrySimulation importado!")
    except ImportError as e:
        print(f"ReentrySimulation nao disponivel: {e}")
        REENTRY_AVAILABLE = False
   
    print("Modulos principais importados com sucesso!")
   
except ImportError as e:
    print(f"Erro critico: {e}")
    sys.exit(1)


def executar_simulacao_foguete():
    print("\nINICIANDO SIMULACAO DE LANCAMENTO DE FOGUETE")
    sim = RocketSimulation()
    sim.executarSimulacao()
    if sim.processarSimulacao():
        print(sim.resultado)
        # Salvar JSON automaticamente
        sim.salvar_json()
        sim.criar_animacao()
    return sim


def executar_simulacao_orbita():
    print("\nINICIANDO SIMULACAO DE ORBITA SATELITAL")
    sim = OrbitalSimulation()
    sim.executarSimulacao()
    if sim.processarSimulacao():
        print(sim.resultado)
        # Salvar JSON automaticamente
        sim.salvar_json()
        sim.criar_animacao()
    return sim

def executar_simulacao_reentrada():
    if not REENTRY_AVAILABLE:
        print("\nSimulacao de Reentrada nao disponivel")
        print("Verifique o arquivo core/reentrada.py")
        return None
   
    print("\nINICIANDO SIMULACAO DE REENTRADA ATMOSFERICA")
    sim = ReentrySimulation()
    sim.executarSimulacao()
    if sim.processarSimulacao():
        print(sim.resultado)
        # Salvar JSON automaticamente
        sim.salvar_json()
        sim.criar_animacao()
    return sim