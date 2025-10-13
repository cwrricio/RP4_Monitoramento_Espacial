import sys
import os

# Debug: verificar o caminho atual
print("__file__:", __file__)
print("Diretório atual:", os.getcwd())

# Adicionar o caminho correto
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
project_root = os.path.dirname(parent_dir)  # sobe mais um nível se necessário

print("Current dir:", current_dir)
print("Parent dir:", parent_dir)
print("Project root:", project_root)

# Adicionar múltiplos caminhos possíveis
sys.path.insert(0, parent_dir)  # pasta simulacao-python
sys.path.insert(0, project_root)  # pasta RP4_Monitoramento_Espacial

print("Python path:")
for path in sys.path:
    print(" -", path)

# Tentar a importação
try:
    from services.simulacoes import (
        executar_simulacao_foguete,
        executar_simulacao_orbita,
        executar_simulacao_reentrada
    )
    print("✅ Importação bem-sucedida!")
except ImportError as e:
    print("❌ Erro na importação:", e)
    # Listar arquivos para debug
    print("\nArquivos no diretório services:")
    services_path = os.path.join(parent_dir, 'services')
    if os.path.exists(services_path):
        for file in os.listdir(services_path):
            print(" -", file)
    else:
        print("Pasta 'services' não encontrada em:", services_path)

def main():
    print(" SISTEMA DE SIMULAÇÃO ESPACIAL")
    print("=" * 60)
    print("1. Lançamento de Foguete")
    print("2. Satélite em Órbita")
    print("3. Reentrada Atmosférica")
    print("4. Todas")
    print("=" * 60)
    opcao = input("Escolha uma opção (1-4): ").strip()

    if opcao == "1":
        executar_simulacao_foguete()
    elif opcao == "2":
        executar_simulacao_orbita()
    elif opcao == "3":
        executar_simulacao_reentrada()
    elif opcao == "4":
        executar_simulacao_foguete()
        executar_simulacao_orbita()
        executar_simulacao_reentrada()
    else:
        print("Opção inválida.")

if __name__ == "__main__":
    main()
