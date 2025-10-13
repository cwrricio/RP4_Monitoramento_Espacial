# services/simulacoes.py
import sys
import os

print("=== DEBUG DETALHADO ===")

# Adiciona caminhos
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, project_root)

# Importações REAIS - sem fallback para dummy
try:
    from core.foguete import RocketSimulation
    from core.orbita import OrbitalSimulation
    
    # Tenta importar reentrada, mas se falhar, continua com as outras
    try:
        from core.reentrada import ReentrySimulation
        REENTRY_AVAILABLE = True
        print("✅ ReentrySimulation importado!")
    except ImportError as e:
        print(f"⚠️  ReentrySimulation não disponível: {e}")
        REENTRY_AVAILABLE = False
    
    print("🎉 MÓDULOS PRINCIPAIS IMPORTADOS COM SUCESSO!")
    
except ImportError as e:
    print(f"❌ Erro crítico: {e}")
    sys.exit(1)

def executar_simulacao_foguete():
    print("\n🚀 INICIANDO SIMULAÇÃO DE LANÇAMENTO DE FOGUETE")
    sim = RocketSimulation()
    sim.executarSimulacao()
    if sim.processarSimulacao():
        print(sim.resultado)
        sim.criar_animacao()
    return sim

def executar_simulacao_orbita():
    print("\n🛰️ INICIANDO SIMULAÇÃO DE ÓRBITA SATELITAL")
    sim = OrbitalSimulation()
    sim.executarSimulacao()
    if sim.processarSimulacao():
        print(sim.resultado)
        sim.criar_animacao()
    return sim

def executar_simulacao_reentrada():
    if not REENTRY_AVAILABLE:
        print("\n❌ Simulação de Reentrada não disponível")
        print("   Verifique o arquivo core/reentrada.py")
        return None
    
    print("\n🔥 INICIANDO SIMULAÇÃO DE REENTRADA ATMOSFÉRICA")
    sim = ReentrySimulation()
    sim.executarSimulacao()
    if sim.processarSimulacao():
        print(sim.resultado)
        sim.criar_animacao()
    return sim