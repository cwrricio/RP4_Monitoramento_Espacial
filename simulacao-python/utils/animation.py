# utils/animation.py - Versão Simplificada e Robusta
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import os
from datetime import datetime


# Verificar se Pillow está instalado
try:
    from matplotlib.animation import PillowWriter
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False
    print("Pillow não instalado. Execute: pip install pillow")


# Verificar se FFmpeg está disponível
try:
    from matplotlib.animation import FFMpegWriter
    FFMPEG_AVAILABLE = True
except ImportError:
    FFMPEG_AVAILABLE = False




class AnimationUtils:
    """Utilitários para criar e salvar animações"""
   
    @staticmethod
    def salvar_animacao(ani, filename=None, formato='gif', fps=30, dpi=100):
        """
        Salva uma animação em arquivo
       
        Parâmetros:
        -----------
        ani : FuncAnimation
            Objeto de animação do matplotlib
        filename : str, opcional
            Nome do arquivo (sem extensão). Se None, usa timestamp
        formato : str
            'gif' ou 'mp4'
        fps : int
            Frames por segundo
        dpi : int
            Resolução da animação
       
        Retorna:
        --------
        str : Caminho completo do arquivo salvo, ou None se falhar
        """
        # Verificar se animação é válida
        if ani is None:
            print("Erro: Objeto de animação é None")
            return None
       
        # Criar diretório de saída
        output_dir = "animacoes"
        try:
            os.makedirs(output_dir, exist_ok=True)
            print(f"Diretório: {output_dir}/")
        except Exception as e:
            print(f"Erro ao criar diretório: {e}")
            return None
       
        # Gerar nome de arquivo
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"animacao_{timestamp}"
       
        # Remover extensão se já tiver
        filename = filename.replace('.gif', '').replace('.mp4', '')
       
        # Processar formato
        formato = formato.lower().strip()
       
        if formato == 'gif':
            if not PILLOW_AVAILABLE:
                print("Pillow não está instalado!")
                print("   Execute: pip install pillow")
                return None
           
            filepath = os.path.join(output_dir, f"{filename}.gif")
            writer = PillowWriter(fps=fps)
            print(f"Salvando GIF: {filename}.gif")
            print(f"   FPS: {fps}, DPI: {dpi}")
           
        elif formato == 'mp4':
            if not FFMPEG_AVAILABLE:
                print("FFmpeg não está disponível!")
                print("   Instale FFmpeg e tente novamente, ou use formato='gif'")
                return None
           
            filepath = os.path.join(output_dir, f"{filename}.mp4")
            writer = FFMpegWriter(fps=fps, metadata=dict(artist='SimulacaoPython'))
            print(f"Salvando MP4: {filename}.mp4")
            print(f"   FPS: {fps}, DPI: {dpi}")
           
        else:
            print(f"Formato '{formato}' inválido. Use 'gif' ou 'mp4'")
            return None
       
        # Salvar arquivo
        try:
            print("⏳ Processando... (isso pode levar 10-60 segundos)")
            print("   Não feche a janela!")
           
            ani.save(filepath, writer=writer, dpi=dpi)
           
            # Verificar se arquivo foi criado
            if os.path.exists(filepath):
                tamanho_kb = os.path.getsize(filepath) / 1024
                print(f"SUCESSO! Animação salva!")
                print(f"   Local: {filepath}")
                print(f"   Tamanho: {tamanho_kb:.1f} KB")
                return filepath
            else:
                print(f"Erro: Arquivo não foi criado em {filepath}")
                return None
               
        except Exception as e:
            print(f"Erro ao salvar animação: {e}")
            print(f"   Tipo do erro: {type(e).__name__}")
           
            if formato == 'mp4':
                print("\nDica: Tente usar formato='gif' em vez de 'mp4'")
           
            # Mostrar traceback completo para debug
            import traceback
            print("\nDetalhes do erro:")
            traceback.print_exc()
           
            return None
   
    @staticmethod
    def criar_animacao_padrao(t, y, title, xlabel, ylabel, interval=30):
        """
        Cria animação padrão de gráfico de linha
       
        Parâmetros:
        -----------
        t : array
            Dados do eixo X (tempo)
        y : array
            Dados do eixo Y (valores)
        title : str
            Título do gráfico
        xlabel : str
            Label do eixo X
        ylabel : str
            Label do eixo Y
        interval : int
            Intervalo entre frames em milissegundos
       
        Retorna:
        --------
        FuncAnimation : Objeto de animação
        """
        print(f"Criando animação: {title}")
        print(f"   Frames: {len(t)}, Intervalo: {interval}ms")
       
        # Criar figura
        fig, ax = plt.subplots(figsize=(10, 6))
        line, = ax.plot([], [], 'b-', linewidth=2)
       
        # Configurar limites
        x_margin = (np.max(t) - np.min(t)) * 0.05
        y_margin = (np.max(y) - np.min(y)) * 0.1
       
        ax.set_xlim(np.min(t) - x_margin, np.max(t) + x_margin)
        ax.set_ylim(np.min(y) - y_margin, np.max(y) + y_margin)
        ax.set_xlabel(xlabel, fontsize=12)
        ax.set_ylabel(ylabel, fontsize=12)
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3)
       
        def init():
            line.set_data([], [])
            return line,
       
        def animate(i):
            line.set_data(t[:i], y[:i])
            return line,
       
        ani = FuncAnimation(fig, animate, init_func=init,
                          frames=len(t), interval=interval,
                          blit=True, repeat=True)
       
        print("Animação criada!")
        return ani
   
    @staticmethod
    def criar_animacao_orbita(positions, times, title):
        """
        Cria animação orbital 2D
       
        Parâmetros:
        -----------
        positions : array (N, 2)
            Posições [x, y] do satélite
        times : array
            Tempo em cada posição
        title : str
            Título da animação
       
        Retorna:
        --------
        FuncAnimation : Objeto de animação
        """
        print(f"Criando animação orbital: {title}")
        print(f"   Frames: {len(times)}")
       
        from matplotlib.patches import Circle
       
        fig, ax = plt.subplots(figsize=(10, 10))
       
        R_EARTH = 6371000
        trail, = ax.plot([], [], 'b-', alpha=0.3, linewidth=1, label='Trajetória')
        satellite, = ax.plot([], [], 'ro', markersize=8, label='Satélite')
       
        earth = Circle((0, 0), R_EARTH, color='blue', alpha=0.6, label='Terra')
        ax.add_patch(earth)
       
        max_r = np.max(np.linalg.norm(positions, axis=1))
        ax.set_xlim(-max_r * 1.2, max_r * 1.2)
        ax.set_ylim(-max_r * 1.2, max_r * 1.2)
        ax.set_aspect('equal')
        ax.set_xlabel("Posição X (m)", fontsize=12)
        ax.set_ylabel("Posição Y (m)", fontsize=12)
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.legend(loc='upper right')
        ax.grid(True, alpha=0.3)
       
        time_text = ax.text(0.02, 0.95, '', transform=ax.transAxes,
                           fontsize=12, bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
       
        def init():
            trail.set_data([], [])
            satellite.set_data([], [])
            time_text.set_text('')
            return trail, satellite, time_text
       
        def animate(i):
            trail.set_data(positions[:i, 0], positions[:i, 1])
            satellite.set_data([positions[i, 0]], [positions[i, 1]])
            time_text.set_text(f'Tempo: {times[i]/60:.1f} min')
            return trail, satellite, time_text
       
        ani = FuncAnimation(fig, animate, init_func=init,
                          frames=len(times), interval=30,
                          blit=True, repeat=True)
       
        print("Animação orbital criada!")
        return ani
   
    @staticmethod
    def criar_animacao_reentrada(y, v, t, title):
        """
        Cria animação de reentrada atmosférica
       
        Parâmetros:
        -----------
        y : array
            Altitude ao longo do tempo
        v : array
            Velocidade ao longo do tempo
        t : array
            Tempo
        title : str
            Título da animação
       
        Retorna:
        --------
        FuncAnimation : Objeto de animação
        """
        print(f"🔥 Criando animação de reentrada: {title}")
        print(f"   Frames: {len(t)}")
       
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
       
        # Gráfico de altitude
        line1, = ax1.plot([], [], 'b-', linewidth=2)
        ax1.set_xlim(0, np.max(t))
        ax1.set_ylim(0, np.max(y) * 1.1)
        ax1.set_xlabel('Tempo (s)', fontsize=12)
        ax1.set_ylabel('Altitude (m)', fontsize=12)
        ax1.set_title('Altitude vs Tempo', fontsize=12, fontweight='bold')
        ax1.grid(True, alpha=0.3)
       
        # Gráfico de velocidade
        line2, = ax2.plot([], [], 'r-', linewidth=2)
        ax2.set_xlim(0, np.max(t))
        ax2.set_ylim(np.min(v) * 1.1, 0)
        ax2.set_xlabel('Tempo (s)', fontsize=12)
        ax2.set_ylabel('Velocidade (m/s)', fontsize=12)
        ax2.set_title('Velocidade vs Tempo', fontsize=12, fontweight='bold')
        ax2.grid(True, alpha=0.3)
       
        fig.suptitle(title, fontsize=14, fontweight='bold')
       
        def init():
            line1.set_data([], [])
            line2.set_data([], [])
            return line1, line2
       
        def animate(i):
            line1.set_data(t[:i], y[:i])
            line2.set_data(t[:i], v[:i])
            return line1, line2
       
        ani = FuncAnimation(fig, animate, init_func=init,
                          frames=len(t), interval=20,
                          blit=True, repeat=True)
       
        print("Animação de reentrada criada!")
        return ani
   
    @staticmethod
    def criar_painel_multigrafico(t, datasets, titles, layout=(2, 2), figsize=(15, 10)):
        """
        Cria painel com múltiplos gráficos animados
       
        Parâmetros:
        -----------
        t : array
            Dados de tempo
        datasets : list of arrays
            Lista de conjuntos de dados para plotar
        titles : list of str
            Lista de títulos para cada subplot
        layout : tuple
            Layout de subplots (linhas, colunas)
        figsize : tuple
            Tamanho da figura
       
        Retorna:
        --------
        FuncAnimation : Objeto de animação
        """
        print(f"Criando painel multigráfico")
        print(f"   Subplots: {layout[0]}x{layout[1]}")
       
        fig, axes = plt.subplots(*layout, figsize=figsize)
        axes = axes.flatten() if hasattr(axes, 'flatten') else [axes]
       
        lines = []
        for i, (ax, data, title) in enumerate(zip(axes, datasets, titles)):
            if i < len(datasets):
                line, = ax.plot([], [], 'b-', linewidth=2)
               
                # Ajustar limites
                valid_data = data[~np.isnan(data)] if len(data) > 0 else [0]
                if len(valid_data) == 0:
                    valid_data = [0]
               
                t_data = t if len(t) == len(data) else t[:len(data)]
               
                ax.set_xlim(np.min(t_data), np.max(t_data))
                y_min, y_max = np.min(valid_data), np.max(valid_data)
                margin = (y_max - y_min) * 0.1 if y_max != y_min else 1
                ax.set_ylim(y_min - margin, y_max + margin)
                ax.set_xlabel('Tempo', fontsize=10)
                ax.set_ylabel(title, fontsize=10)
                ax.set_title(title, fontsize=11, fontweight='bold')
                ax.grid(True, alpha=0.3)
                lines.append((line, t_data, data))
       
        plt.tight_layout()
       
        def init():
            for line, _, _ in lines:
                line.set_data([], [])
            return [line for line, _, _ in lines]
       
        def animate(i):
            for line, t_data, data in lines:
                idx = min(i, len(data) - 1)
                line.set_data(t_data[:idx], data[:idx])
            return [line for line, _, _ in lines]
       
        max_frames = max(len(data) for _, _, data in lines)
        ani = FuncAnimation(fig, animate, init_func=init,
                          frames=max_frames, interval=30,
                          blit=True, repeat=True)
       
        print("Painel multigráfico criado!")
        return ani

# Verificação inicial ao importar
if __name__ != "__main__":
    if not PILLOW_AVAILABLE:
        print("=" * 60)
        print("AVISO: Pillow não está instalado")
        print("   Para salvar animações como GIF, execute:")
        print("   pip install pillow")
        print("=" * 60)