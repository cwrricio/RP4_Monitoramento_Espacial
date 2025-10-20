import sys
import os

# Debug: verificar caminhos
print("Arquivo atual:", __file__)
print("Diretorio atual:", os.getcwd())

# Configurar caminhos
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
project_root = os.path.dirname(parent_dir)

print("Diretorio atual:", current_dir)
print("Diretorio pai:", parent_dir)
print("Raiz do projeto:", project_root)

# Adicionar caminhos ao Python path
sys.path.insert(0, parent_dir)
sys.path.insert(0, project_root)

print("Python path:")
for path in sys.path:
    print(" -", path)

# Tentar importar
try:
    from services.simulacoes import (
        executar_simulacao_foguete,
        executar_simulacao_orbita,
        executar_simulacao_reentrada
    )
    print("Importacao bem-sucedida!")
except ImportError as e:
    print("Erro na importacao:", e)
    # Debug: listar arquivos
    print("\nArquivos no diretorio services:")
    services_path = os.path.join(parent_dir, 'services')
    if os.path.exists(services_path):
        for file in os.listdir(services_path):
            print(" -", file)
    else:
        print("Pasta 'services' nao encontrada em:", services_path)

def main():
    print("SISTEMA DE SIMULACAO ESPACIAL")
    print("=" * 60)
    print("1. Lancamento de Foguete")
    print("2. Satelite em Orbita")
    print("3. Reentrada Atmosferica")
    print("4. Todas as simulacoes")
    print("=" * 60)
    opcao = input("Escolha uma opcao (1-4): ").strip()

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
        print("Opcao invalida.")

if __name__ == "__main__":
    main()