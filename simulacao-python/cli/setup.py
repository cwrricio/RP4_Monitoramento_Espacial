"""
Script de instalação para a CLI
"""


import sys
import subprocess
import importlib.util


def check_and_install_dependencies():
    """Verifica e instala dependências necessárias"""
    dependencies = [
        'requests',
        'rich',
        'questionary',
        'websockets'
    ]
   
    missing_deps = []
   
    for dep in dependencies:
        if importlib.util.find_spec(dep) is None:
            missing_deps.append(dep)
   
    if missing_deps:
        print(f"📦 Instalando dependências faltantes: {', '.join(missing_deps)}")
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install'
            ] + missing_deps)
            print("Dependências instaladas com sucesso!")
        except subprocess.CalledProcessError as e:
            print(f"Erro ao instalar dependências: {e}")
            return False
   
    return True

if __name__ == "__main__":
    check_and_install_dependencies()