"""
CLI (Command Line Interface) para o Sistema de Simulação Espacial
Interface de linha de comando para interagir com o sistema via terminal
"""

__version__ = "1.0.0"
__author__ = "Sistema de Simulação Espacial"
__description__ = "CLI para gerenciamento de simulações espaciais e Digital Twins"

from .main import SimulationCLI, main

__all__ = ["SimulationCLI", "main"]