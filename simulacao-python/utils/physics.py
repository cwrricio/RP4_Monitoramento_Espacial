import numpy as np

class PhysicsUtils:
    """Utilitários para cálculos físicos comuns nas simulações"""
    
    # Constantes físicas
    G = 6.67430e-11      # Constante gravitacional (m³/kg/s²)
    M_EARTH = 5.9722e24  # Massa da Terra (kg)
    R_EARTH = 6.371e6    # Raio da Terra (m)
    G0 = 9.81            # Gravidade ao nível do mar (m/s²)
    RHO0 = 1.225         # Densidade do ar ao nível do mar (kg/m³)
    H_ATMOSPHERE = 8500  # Escala de altura atmosférica (m)
    
    @staticmethod
    def velocidade_orbital(altitude):
        """Calcula a velocidade orbital para uma dada altitude"""
        r = PhysicsUtils.R_EARTH + altitude
        return np.sqrt(PhysicsUtils.G * PhysicsUtils.M_EARTH / r)
    
    @staticmethod
    def periodo_orbital(altitude):
        """Calcula o período orbital para uma dada altitude"""
        r = PhysicsUtils.R_EARTH + altitude
        return 2 * np.pi * np.sqrt(r**3 / (PhysicsUtils.G * PhysicsUtils.M_EARTH))
    
    @staticmethod
    def densidade_ar(altitude):
        """Calcula a densidade do ar em função da altitude"""
        return PhysicsUtils.RHO0 * np.exp(-altitude / PhysicsUtils.H_ATMOSPHERE)
    
    @staticmethod
    def gravidade(altitude):
        """Calcula a aceleração gravitacional em função da altitude"""
        r = PhysicsUtils.R_EARTH + altitude
        return PhysicsUtils.G * PhysicsUtils.M_EARTH / r**2
    
    @staticmethod
    def forca_arrasto(velocidade, densidade, coeficiente_arrasto, area):
        """Calcula a força de arrasto"""
        return 0.5 * densidade * coeficiente_arrasto * area * velocidade**2
    
    @staticmethod
    def velocidade_escape(altitude=0):
        """Calcula a velocidade de escape"""
        r = PhysicsUtils.R_EARTH + altitude
        return np.sqrt(2 * PhysicsUtils.G * PhysicsUtils.M_EARTH / r)
    
    @staticmethod
    def energia_orbital(altitude, velocidade):
        """Calcula a energia orbital específica"""
        r = PhysicsUtils.R_EARTH + altitude
        return 0.5 * velocidade**2 - PhysicsUtils.G * PhysicsUtils.M_EARTH / r
    
    @staticmethod
    def excentricidade_orbital(altitude, velocidade, angulo=0):
        """Calcula a excentricidade orbital"""
        r = PhysicsUtils.R_EARTH + altitude
        v = velocidade
        h = r * v * np.cos(angulo)  # Momento angular específico
        
        energia = PhysicsUtils.energia_orbital(altitude, velocidade)
        e = np.sqrt(1 + (2 * energia * h**2) / (PhysicsUtils.G * PhysicsUtils.M_EARTH)**2)
        return e
    
    @staticmethod
    def temperatura_reatrada(velocidade, altitude):
        """Estima a temperatura durante reentrada (simplificado)"""
        densidade = PhysicsUtils.densidade_ar(altitude)
        heat_flux = velocidade**3 * np.sqrt(densidade)
        return 300 + heat_flux * 1e-9  # Temperatura em Kelvin
    
    @staticmethod
    def pressao_dinamica(velocidade, altitude):
        """Calcula a pressão dinâmica"""
        densidade = PhysicsUtils.densidade_ar(altitude)
        return 0.5 * densidade * velocidade**2
    
    @staticmethod
    def numero_mach(velocidade, altitude):
        """Calcula o número de Mach"""
        # Velocidade do som aproximada na atmosfera
        vsom = 340.29  # m/s a 15°C ao nível do mar
        return velocidade / vsom
    
    @staticmethod
    def integracao_rk4(f, t, y, dt, *args):
        """
        Implementação do método Runge-Kutta de 4ª ordem
        
        Args:
            f: função das derivadas f(t, y, *args)
            t: tempo atual
            y: estado atual
            dt: passo de tempo
            *args: argumentos adicionais para f
            
        Returns:
            Estado no próximo passo de tempo
        """
        k1 = dt * f(t, y, *args)
        k2 = dt * f(t + dt/2, y + k1/2, *args)
        k3 = dt * f(t + dt/2, y + k2/2, *args)
        k4 = dt * f(t + dt, y + k3, *args)
        
        return y + (k1 + 2*k2 + 2*k3 + k4) / 6