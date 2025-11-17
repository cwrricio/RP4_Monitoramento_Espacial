import sys
import os
import time
import matplotlib.pyplot as plt


# Configurar caminhos
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)


print("=== SISTEMA DE SIMULAÇÃO ESPACIAL COM OBSERVER ===")


# Importar módulos principais com fallback robusto
try:
    from core.foguete import RocketSimulation
    from core.orbita import OrbitalSimulation
    from core.reentrada import ReentrySimulation
    print("Módulos principais importados!")
   
    # Verificar se as classes têm os métodos do Observer
    foguete_test = RocketSimulation()
    print(f"RocketSimulation tem Observer: {hasattr(foguete_test, 'add_simulation_observer')}")
except ImportError as e:
    print(f"Erro importando módulos principais: {e}")
    sys.exit(1)


# Importar observers com fallback robusto
try:
    from services.observers import LoggingObserver, EmergencyProtocolObserver
    print("Observers importados!")
except ImportError as e:
    print(f"Erro importando observers: {e}")
    print("Criando observers básicos...")
   
    # Fallback: criar observers básicos
    class LoggingObserver:
        def on_simulation_update(self, simulation_type, data):
            status = data.get('status', 'UPDATE')
            if status == 'INICIANDO':
                print(f"INICIANDO: {simulation_type.value}")
            elif status == 'EXECUTANDO':
                progresso = data.get('progresso', 0)
                print(f"{simulation_type.value}: {progresso:.1f}%")
       
        def on_simulation_complete(self, simulation_type, results):
            print(f"CONCLUIDO: {simulation_type.value}")
       
        def on_emergency_detected(self, emergency_type, simulation_data):
            print(f"EMERGENCIA: {emergency_type}")
   
    class EmergencyProtocolObserver:
        def on_emergency_detected(self, emergency_type, simulation_data):
            print(f"PROTOCOLO ATIVADO: {emergency_type}")


# Importar utilitários de animação
try:
    from utils.animation import AnimationUtils
    ANIMATION_UTILS_AVAILABLE = True
    print("AnimationUtils importado!")
except ImportError as e:
    print(f"Aviso: AnimationUtils não disponível: {e}")
    ANIMATION_UTILS_AVAILABLE = False




class CLIObserver:
    """Observer personalizado para a interface de linha de comando"""
   
    def __init__(self):
        self.last_update_time = time.time()
        self.current_progress = 0
        self.current_simulation = ""
   
    def on_simulation_update(self, simulation_type, data):
        status = data.get('status', 'UPDATE')
       
        if status == 'INICIANDO':
            self.current_simulation = simulation_type.value
            print(f"\nINICIANDO: {self.current_simulation}")
            print("=" * 50)
       
        elif status == 'EXECUTANDO':
            progresso = data.get('progresso', 0)
           
            # Atualizar a cada 5% ou a cada 2 segundos
            current_time = time.time()
            if progresso >= self.current_progress + 5 or current_time - self.last_update_time >= 2:
                altitude = data.get('altitude_atual', 0)
                velocidade = data.get('velocidade_atual', 0)
               
                # Barra de progresso simples
                bar_length = 30
                filled_length = int(bar_length * progresso / 100)
                bar = '#' * filled_length + '-' * (bar_length - filled_length)
               
                print(f"\rPROGRESSO: [{bar}] {progresso:5.1f}% | Alt: {altitude:8.0f}m | Vel: {velocidade:6.0f}m/s", end='', flush=True)
               
                self.current_progress = progresso
                self.last_update_time = current_time
       
        elif status == 'ANIMACAO_INICIADA':
            print(f"\nCriando animação para {simulation_type.value}...")
       
        elif status == 'ANIMACAO_CONCLUIDA':
            print(f"Animação concluída!")
   
    def on_simulation_complete(self, simulation_type, results):
        print(f"\n\nSIMULAÇÃO CONCLUIDA: {simulation_type.value}")
        print("=" * 50)
       
        # Extrair métricas importantes dos resultados
        estatisticas = results.get('estatisticas', {})
        if 'altitude' in estatisticas:
            alt = estatisticas['altitude']
            print(f"Altitude: Max {alt.get('max', 0):.0f}m, Media {alt.get('media', 0):.0f}m")
       
        if 'velocidade' in estatisticas:
            vel = estatisticas['velocidade']
            print(f"Velocidade: Max {vel.get('max', 0):.0f}m/s")
       
        print("=" * 50)
   
    def on_emergency_detected(self, emergency_type, simulation_data):
        print(f"\nALERTA DE EMERGENCIA: {emergency_type}")
        print(f"  Severidade: {simulation_data.get('severidade', 'DESCONHECIDA')}")
        if 'altitude' in simulation_data:
            print(f"  Altitude: {simulation_data['altitude']:.0f}m")
        if 'tempo' in simulation_data:
            print(f"  Tempo: {simulation_data['tempo']:.1f}s")




def executar_simulacao_com_observers(tipo_simulacao):
    """Executa uma simulação com observers para feedback em tempo real"""
    try:
        # Criar observers
        cli_observer = CLIObserver()
        logging_observer = LoggingObserver()
        emergency_observer = EmergencyProtocolObserver()
       
        # Executar simulação baseada no tipo
        if tipo_simulacao == "foguete":
            simulacao = RocketSimulation()
        elif tipo_simulacao == "orbita":
            simulacao = OrbitalSimulation()
        elif tipo_simulacao == "reentrada":
            simulacao = ReentrySimulation()
        else:
            print("Tipo de simulação desconhecido")
            return
       
        # Registrar observers
        simulacao.add_simulation_observer(cli_observer)
        simulacao.add_simulation_observer(logging_observer)
        simulacao.add_emergency_observer(cli_observer)
        simulacao.add_emergency_observer(emergency_observer)
       
        # Executar simulação
        print(f"\nExecutando {tipo_simulacao}...")
        simulacao.executarSimulacao()
       
        # Perguntar sobre animação
        print("\n")
        criar_animacao = input("Criar animação? (s/N): ").strip().lower()
       
        if criar_animacao in ['s', 'sim', 'y', 'yes']:
            if not ANIMATION_UTILS_AVAILABLE:
                print("❌ AnimationUtils não disponível. Usando método padrão...")
                simulacao.criar_animacao()
            else:
                # Perguntar formato
                print("\nFormatos disponíveis:")
                print("1. GIF (recomendado - funciona sempre)")
                print("2. MP4 (requer FFmpeg instalado)")
                print("3. Apenas visualizar (não salvar)")
               
                formato_opcao = input("Escolha (1-3): ").strip()
               
                # Criar animação baseada no tipo
                print("\n🎬 Criando animação...")
                ani = None
               
                if tipo_simulacao == "foguete":
                    ani = AnimationUtils.criar_animacao_padrao(
                        simulacao.t, simulacao.y,
                        "LANÇAMENTO DE FOGUETE - ALTITUDE VS TEMPO",
                        "Tempo (s)",
                        "Altitude (m)",
                        interval=30
                    )
               
                elif tipo_simulacao == "orbita":
                    ani = AnimationUtils.criar_animacao_orbita(
                        simulacao.positions,
                        simulacao.times,
                        "SIMULAÇÃO ORBITAL - SATÉLITE EM ÓRBITA"
                    )
               
                elif tipo_simulacao == "reentrada":
                    ani = AnimationUtils.criar_animacao_reentrada(
                        simulacao.y, simulacao.v, simulacao.t,
                        "REENTRADA ATMOSFÉRICA"
                    )
               
                # Salvar ou apenas visualizar
                if ani:
                    if formato_opcao == "1":
                        print("\n💾 Salvando como GIF...")
                        nome_arquivo = f"{tipo_simulacao}_{time.strftime('%Y%m%d_%H%M%S')}"
                        arquivo_salvo = AnimationUtils.salvar_animacao(
                            ani,
                            filename=nome_arquivo,
                            formato='gif',
                            fps=30,
                            dpi=100
                        )
                        if arquivo_salvo:
                            print(f"✅ Animação salva em: {arquivo_salvo}")
                   
                    elif formato_opcao == "2":
                        print("\n💾 Salvando como MP4...")
                        print("⚠️  Certifique-se de que FFmpeg está instalado!")
                        nome_arquivo = f"{tipo_simulacao}_{time.strftime('%Y%m%d_%H%M%S')}"
                        arquivo_salvo = AnimationUtils.salvar_animacao(
                            ani,
                            filename=nome_arquivo,
                            formato='mp4',
                            fps=30,
                            dpi=100
                        )
                        if arquivo_salvo:
                            print(f"✅ Animação salva em: {arquivo_salvo}")
                        else:
                            print("❌ Erro ao salvar MP4. Tente GIF em vez disso.")
                   
                    elif formato_opcao == "3":
                        print("\n👀 Apenas visualizando (não será salvo)...")
                   
                    # Mostrar animação
                    print("\n🎥 Exibindo animação...")
                    plt.show()
       
        # Perguntar sobre salvamento JSON
        print("\n")
        salvar_json = input("Salvar resultados em JSON? (s/N): ").strip().lower()
        if salvar_json in ['s', 'sim', 'y', 'yes']:
            filename = simulacao.salvar_json()
            if filename:
                print(f"✅ Dados salvos em: {filename}")
       
        return simulacao
   
    except Exception as e:
        print(f"❌ Erro na execução: {e}")
        import traceback
        traceback.print_exc()
        return None




def main():
    print("\nSISTEMA DE SIMULAÇÃO ESPACIAL COM OBSERVER")
    print("=" * 60)
    print("1. Lançamento de Foguete")
    print("2. Satélite em Órbita")
    print("3. Reentrada Atmosférica")
    print("4. Todas as simulações")
    print("=" * 60)
   
    opcao = input("Escolha uma opção (1-4): ").strip()
   
    if opcao == "1":
        print("\n" + "="*50)
        print("INICIANDO SIMULAÇÃO DE FOGUETE")
        print("="*50)
        executar_simulacao_com_observers("foguete")
   
    elif opcao == "2":
        print("\n" + "="*50)
        print("INICIANDO SIMULAÇÃO ORBITAL")
        print("="*50)
        executar_simulacao_com_observers("orbita")
   
    elif opcao == "3":
        print("\n" + "="*50)
        print("INICIANDO SIMULAÇÃO DE REENTRADA")
        print("="*50)
        executar_simulacao_com_observers("reentrada")
   
    elif opcao == "4":
        print("\n" + "="*50)
        print("EXECUTANDO TODAS AS SIMULAÇÕES")
        print("="*50)
       
        executar_simulacao_com_observers("foguete")
       
        print("\n\n")
        continuar = input("Continuar para próxima simulação? (s/N): ").strip().lower()
        if continuar in ['s', 'sim', 'y', 'yes']:
            executar_simulacao_com_observers("orbita")
       
        print("\n\n")
        continuar = input("Continuar para próxima simulação? (s/N): ").strip().lower()
        if continuar in ['s', 'sim', 'y', 'yes']:
            executar_simulacao_com_observers("reentrada")
   
    else:
        print("❌ Opção inválida.")
   
    print("\n")
    print("=" * 60)
    print("SISTEMA ENCERRADO")
    print("=" * 60)

if __name__ == "__main__":
    main()