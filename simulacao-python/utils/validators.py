"""
Módulo de validações para o sistema de simulação espacial
Validações de parâmetros físicos, dados de entrada e configurações
"""

import re
import math
from typing import Dict, Any, List, Optional, Tuple, Union
from datetime import datetime, timedelta
import numpy as np
from enum import Enum

from ..core.enums import TipoSimulacao, GravidadeEmergencia


class ValidationError(Exception):
    """Exceção base para erros de validação"""
    pass


class PhysicsValidationError(ValidationError):
    """Exceção para erros de validação de parâmetros físicos"""
    pass


class SimulationValidationError(ValidationError):
    """Exceção para erros de validação de simulação"""
    pass


class DigitalTwinValidationError(ValidationError):
    """Exceção para erros de validação de Digital Twins"""
    pass


class EmergencyValidationError(ValidationError):
    """Exceção para erros de validação de emergências"""
    pass


class ParameterValidator:
    """
    Validador de parâmetros para simulações espaciais
    """
    
    # Limites físicos realistas
    PHYSICAL_LIMITS = {
        'altitude_min': 0.0,           # Nível do mar
        'altitude_max': 1000000.0,     # 1000 km
        'velocity_min': 0.0,
        'velocity_max': 12000.0,       # Velocidade de escape + margem
        'mass_min': 0.1,               # 100g
        'mass_max': 1000000.0,         # 1000 toneladas
        'thrust_min': 0.0,
        'thrust_max': 1e8,             # 100 MN
        'temperature_min': 0.0,        # Zero absoluto
        'temperature_max': 10000.0,    # 10,000K
        'time_min': 0.0,
        'time_max': 86400.0,           # 24 horas
        'pressure_min': 0.0,
        'pressure_max': 1e7,           # 1000 atm
        'density_min': 0.0,
        'density_max': 10000.0,        # 10x densidade da água
        'angle_min': -360.0,
        'angle_max': 360.0,
        'g_force_min': 0.0,
        'g_force_max': 50.0,           # Limite humano extremo
    }
    
    @classmethod
    def validate_altitude(cls, altitude: float, context: str = "") -> float:
        """
        Valida altitude em metros
        
        Args:
            altitude: Altitude a validar
            context: Contexto para mensagens de erro
            
        Returns:
            float: Altitude validada
            
        Raises:
            PhysicsValidationError: Se a altitude for inválida
        """
        if not isinstance(altitude, (int, float)):
            raise PhysicsValidationError(
                f"{context}Altitude deve ser um número, recebido: {type(altitude)}"
            )
        
        if altitude < cls.PHYSICAL_LIMITS['altitude_min']:
            raise PhysicsValidationError(
                f"{context}Altitude não pode ser negativa: {altitude:.2f} m"
            )
        
        if altitude > cls.PHYSICAL_LIMITS['altitude_max']:
            raise PhysicsValidationError(
                f"{context}Altitude muito alta: {altitude:.2f} m > {cls.PHYSICAL_LIMITS['altitude_max']:.0f} m"
            )
        
        return float(altitude)
    
    @classmethod
    def validate_velocity(cls, velocity: float, context: str = "") -> float:
        """
        Valida velocidade em m/s
        
        Args:
            velocity: Velocidade a validar
            context: Contexto para mensagens de erro
            
        Returns:
            float: Velocidade validada
        """
        if not isinstance(velocity, (int, float)):
            raise PhysicsValidationError(
                f"{context}Velocidade deve ser um número, recebido: {type(velocity)}"
            )
        
        abs_velocity = abs(velocity)
        
        if abs_velocity > cls.PHYSICAL_LIMITS['velocity_max']:
            raise PhysicsValidationError(
                f"{context}Velocidade muito alta: {abs_velocity:.2f} m/s > {cls.PHYSICAL_LIMITS['velocity_max']:.0f} m/s"
            )
        
        return float(velocity)
    
    @classmethod
    def validate_mass(cls, mass: float, context: str = "") -> float:
        """
        Valida massa em kg
        
        Args:
            mass: Massa a validar
            context: Contexto para mensagens de erro
            
        Returns:
            float: Massa validada
        """
        if not isinstance(mass, (int, float)):
            raise PhysicsValidationError(
                f"{context}Massa deve ser um número, recebido: {type(mass)}"
            )
        
        if mass <= cls.PHYSICAL_LIMITS['mass_min']:
            raise PhysicsValidationError(
                f"{context}Massa deve ser positiva: {mass:.2f} kg"
            )
        
        if mass > cls.PHYSICAL_LIMITS['mass_max']:
            raise PhysicsValidationError(
                f"{context}Massa muito grande: {mass:.2f} kg > {cls.PHYSICAL_LIMITS['mass_max']:.0f} kg"
            )
        
        return float(mass)
    
    @classmethod
    def validate_thrust(cls, thrust: float, context: str = "") -> float:
        """
        Valida empuxo em Newtons
        
        Args:
            thrust: Empuxo a validar
            context: Contexto para mensagens de erro
            
        Returns:
            float: Empuxo validado
        """
        if not isinstance(thrust, (int, float)):
            raise PhysicsValidationError(
                f"{context}Empuxo deve ser um número, recebido: {type(thrust)}"
            )
        
        if thrust < cls.PHYSICAL_LIMITS['thrust_min']:
            raise PhysicsValidationError(
                f"{context}Empuxo não pode ser negativo: {thrust:.2f} N"
            )
        
        if thrust > cls.PHYSICAL_LIMITS['thrust_max']:
            raise PhysicsValidationError(
                f"{context}Empuxo muito grande: {thrust:.2f} N > {cls.PHYSICAL_LIMITS['thrust_max']:.0f} N"
            )
        
        return float(thrust)
    
    @classmethod
    def validate_temperature(cls, temperature: float, context: str = "") -> float:
        """
        Valida temperatura em Kelvin
        
        Args:
            temperature: Temperatura a validar
            context: Contexto para mensagens de erro
            
        Returns:
            float: Temperatura validada
        """
        if not isinstance(temperature, (int, float)):
            raise PhysicsValidationError(
                f"{context}Temperatura deve ser um número, recebido: {type(temperature)}"
            )
        
        if temperature < cls.PHYSICAL_LIMITS['temperature_min']:
            raise PhysicsValidationError(
                f"{context}Temperatura abaixo do zero absoluto: {temperature:.2f} K"
            )
        
        if temperature > cls.PHYSICAL_LIMITS['temperature_max']:
            raise PhysicsValidationError(
                f"{context}Temperatura muito alta: {temperature:.2f} K > {cls.PHYSICAL_LIMITS['temperature_max']:.0f} K"
            )
        
        return float(temperature)
    
    @classmethod
    def validate_time_interval(cls, time: float, context: str = "") -> float:
        """
        Valida intervalo de tempo em segundos
        
        Args:
            time: Tempo a validar
            context: Contexto para mensagens de erro
            
        Returns:
            float: Tempo validado
        """
        if not isinstance(time, (int, float)):
            raise PhysicsValidationError(
                f"{context}Tempo deve ser um número, recebido: {type(time)}"
            )
        
        if time < cls.PHYSICAL_LIMITS['time_min']:
            raise PhysicsValidationError(
                f"{context}Tempo não pode ser negativo: {time:.2f} s"
            )
        
        if time > cls.PHYSICAL_LIMITS['time_max']:
            raise PhysicsValidationError(
                f"{context}Tempo muito longo: {time:.2f} s > {cls.PHYSICAL_LIMITS['time_max']:.0f} s"
            )
        
        return float(time)
    
    @classmethod
    def validate_g_force(cls, g_force: float, context: str = "") -> float:
        """
        Valida força G
        
        Args:
            g_force: Força G a validar
            context: Contexto para mensagens de erro
            
        Returns:
            float: Força G validada
        """
        if not isinstance(g_force, (int, float)):
            raise PhysicsValidationError(
                f"{context}Força G deve ser um número, recebido: {type(g_force)}"
            )
        
        if g_force < cls.PHYSICAL_LIMITS['g_force_min']:
            raise PhysicsValidationError(
                f"{context}Força G não pode ser negativa: {g_force:.2f} G"
            )
        
        if g_force > cls.PHYSICAL_LIMITS['g_force_max']:
            raise PhysicsValidationError(
                f"{context}Força G muito alta para humanos: {g_force:.2f} G > {cls.PHYSICAL_LIMITS['g_force_max']:.0f} G"
            )
        
        return float(g_force)
    
    @classmethod
    def validate_angle(cls, angle: float, context: str = "") -> float:
        """
        Valida ângulo em graus
        
        Args:
            angle: Ângulo a validar
            context: Contexto para mensagens de erro
            
        Returns:
            float: Ângulo validado
        """
        if not isinstance(angle, (int, float)):
            raise PhysicsValidationError(
                f"{context}Ângulo deve ser um número, recebido: {type(angle)}"
            )
        
        # Normalizar ângulo para o range [-360, 360]
        normalized_angle = angle % 360
        if normalized_angle > 180:
            normalized_angle -= 360
        
        if not (cls.PHYSICAL_LIMITS['angle_min'] <= normalized_angle <= cls.PHYSICAL_LIMITS['angle_max']):
            raise PhysicsValidationError(
                f"{context}Ângulo fora do range válido: {angle:.2f}°"
            )
        
        return normalized_angle


class SimulationValidator:
    """
    Validador específico para parâmetros de simulação
    """
    
    @classmethod
    def validate_simulation_parameters(cls, params: Dict[str, Any], simulation_type: TipoSimulacao) -> Dict[str, Any]:
        """
        Valida parâmetros de simulação baseado no tipo
        
        Args:
            params: Parâmetros da simulação
            simulation_type: Tipo de simulação
            
        Returns:
            Dict[str, Any]: Parâmetros validados
        """
        validated_params = {}
        
        try:
            # Validações comuns a todas as simulações
            if 'tempo_maximo' in params:
                validated_params['tempo_maximo'] = ParameterValidator.validate_time_interval(
                    params['tempo_maximo'], "Tempo máximo: "
                )
            
            if 'descricao' in params:
                validated_params['descricao'] = cls._validate_description(params['descricao'])
            
            # Validações específicas por tipo de simulação
            if simulation_type == TipoSimulacao.FOGUETE:
                validated_params.update(cls._validate_rocket_parameters(params))
            elif simulation_type == TipoSimulacao.ORBITAL:
                validated_params.update(cls._validate_orbital_parameters(params))
            elif simulation_type == TipoSimulacao.REENTRADA:
                validated_params.update(cls._validate_reentry_parameters(params))
            
            return validated_params
            
        except ValidationError:
            raise
        except Exception as e:
            raise SimulationValidationError(f"Erro na validação dos parâmetros: {str(e)}")
    
    @classmethod
    def _validate_rocket_parameters(cls, params: Dict[str, Any]) -> Dict[str, Any]:
        """Valida parâmetros específicos de foguete"""
        validated = {}
        
        if 'massa_inicial' in params:
            validated['massa_inicial'] = ParameterValidator.validate_mass(
                params['massa_inicial'], "Massa inicial: "
            )
        
        if 'massa_combustivel' in params:
            validated['massa_combustivel'] = ParameterValidator.validate_mass(
                params['massa_combustivel'], "Massa de combustível: "
            )
            
            # Validar que massa_combustivel <= massa_inicial
            if 'massa_inicial' in validated and validated['massa_combustivel'] > validated['massa_inicial']:
                raise PhysicsValidationError(
                    f"Massa de combustível ({validated['massa_combustivel']:.2f} kg) "
                    f"não pode ser maior que massa inicial ({validated['massa_inicial']:.2f} kg)"
                )
        
        if 'empuxo' in params:
            validated['empuxo'] = ParameterValidator.validate_thrust(
                params['empuxo'], "Empuxo: "
            )
        
        return validated
    
    @classmethod
    def _validate_orbital_parameters(cls, params: Dict[str, Any]) -> Dict[str, Any]:
        """Valida parâmetros específicos de simulação orbital"""
        validated = {}
        
        if 'altitude_inicial' in params and params['altitude_inicial'] is not None:
            validated['altitude_inicial'] = ParameterValidator.validate_altitude(
                params['altitude_inicial'], "Altitude inicial: "
            )
            
            # Altitude orbital mínima realista
            if validated['altitude_inicial'] < 160000:  # 160 km
                raise PhysicsValidationError(
                    f"Altitude orbital muito baixa: {validated['altitude_inicial']:.2f} m < 160000 m"
                )
        
        return validated
    
    @classmethod
    def _validate_reentry_parameters(cls, params: Dict[str, Any]) -> Dict[str, Any]:
        """Valida parâmetros específicos de reentrada"""
        validated = {}
        
        if 'altitude_inicial' in params and params['altitude_inicial'] is not None:
            validated['altitude_inicial'] = ParameterValidator.validate_altitude(
                params['altitude_inicial'], "Altitude inicial: "
            )
        
        if 'velocidade_inicial' in params and params['velocidade_inicial'] is not None:
            validated['velocidade_inicial'] = ParameterValidator.validate_velocity(
                params['velocidade_inicial'], "Velocidade inicial: "
            )
            
            # Velocidade mínima para reentrada
            if validated['velocidade_inicial'] < 1000:  # 1 km/s
                raise PhysicsValidationError(
                    f"Velocidade de reentrada muito baixa: {validated['velocidade_inicial']:.2f} m/s < 1000 m/s"
                )
        
        return validated
    
    @classmethod
    def _validate_description(cls, description: str) -> str:
        """Valida descrição da simulação"""
        if not isinstance(description, str):
            raise ValidationError("Descrição deve ser uma string")
        
        description = description.strip()
        
        if len(description) == 0:
            raise ValidationError("Descrição não pode estar vazia")
        
        if len(description) > 500:
            raise ValidationError(f"Descrição muito longa: {len(description)} > 500 caracteres")
        
        # Validar caracteres permitidos
        if not re.match(r'^[a-zA-Z0-9\s\-\_\.\,\(\)\:]+$', description):
            raise ValidationError("Descrição contém caracteres inválidos")
        
        return description


class DigitalTwinValidator:
    """
    Validador para Digital Twins
    """
    
    @classmethod
    def validate_asset_id(cls, asset_id: str) -> str:
        """
        Valida ID do ativo físico
        
        Args:
            asset_id: ID do ativo
            
        Returns:
            str: Asset ID validado
        """
        if not isinstance(asset_id, str):
            raise DigitalTwinValidationError("Asset ID deve ser uma string")
        
        asset_id = asset_id.strip()
        
        if len(asset_id) < 3:
            raise DigitalTwinValidationError("Asset ID deve ter pelo menos 3 caracteres")
        
        if len(asset_id) > 100:
            raise DigitalTwinValidationError("Asset ID deve ter no máximo 100 caracteres")
        
        # Validar formato: letras, números, hífens, underscores
        if not re.match(r'^[a-zA-Z0-9_\-\.]+$', asset_id):
            raise DigitalTwinValidationError(
                "Asset ID deve conter apenas letras, números, hífens, underscores e pontos"
            )
        
        return asset_id
    
    @classmethod
    def validate_twin_parameters(cls, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida parâmetros do Digital Twin
        
        Args:
            parameters: Parâmetros do Digital Twin
            
        Returns:
            Dict[str, Any]: Parâmetros validados
        """
        if not isinstance(parameters, dict):
            raise DigitalTwinValidationError("Parâmetros devem ser um dicionário")
        
        validated_params = {}
        
        for key, value in parameters.items():
            if not isinstance(key, str):
                raise DigitalTwinValidationError("Chaves dos parâmetros devem ser strings")
            
            # Validar valor baseado no tipo
            if isinstance(value, (int, float)):
                # Para valores numéricos, aplicar validações físicas quando possível
                if key.lower() in ['mass', 'massa']:
                    validated_params[key] = ParameterValidator.validate_mass(value, f"{key}: ")
                elif key.lower() in ['altitude', 'altura']:
                    validated_params[key] = ParameterValidator.validate_altitude(value, f"{key}: ")
                elif key.lower() in ['velocity', 'velocidade']:
                    validated_params[key] = ParameterValidator.validate_velocity(value, f"{key}: ")
                elif key.lower() in ['temperature', 'temperatura']:
                    validated_params[key] = ParameterValidator.validate_temperature(value, f"{key}: ")
                else:
                    validated_params[key] = value
            else:
                validated_params[key] = value
        
        return validated_params
    
    @classmethod
    def validate_telemetry_data(cls, telemetry_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida dados de telemetria
        
        Args:
            telemetry_data: Dados de telemetria
            
        Returns:
            Dict[str, Any]: Dados de telemetria validados
        """
        if not isinstance(telemetry_data, dict):
            raise DigitalTwinValidationError("Dados de telemetria devem ser um dicionário")
        
        if not telemetry_data:
            raise DigitalTwinValidationError("Dados de telemetria não podem estar vazios")
        
        # Validar campos obrigatórios
        if 'timestamp' not in telemetry_data:
            raise DigitalTwinValidationError("Timestamp é obrigatório nos dados de telemetria")
        
        validated_telemetry = {}
        
        for key, value in telemetry_data.items():
            if key == 'timestamp':
                # Validar timestamp
                if isinstance(value, (int, float)):
                    # Timestamp numérico
                    if value <= 0:
                        raise DigitalTwinValidationError("Timestamp deve ser positivo")
                    validated_telemetry[key] = value
                elif isinstance(value, str):
                    # Tentar converter string para datetime
                    try:
                        datetime.fromisoformat(value.replace('Z', '+00:00'))
                        validated_telemetry[key] = value
                    except ValueError:
                        raise DigitalTwinValidationError(f"Timestamp em formato inválido: {value}")
                else:
                    raise DigitalTwinValidationError("Timestamp deve ser numérico ou string ISO")
            else:
                validated_telemetry[key] = value
        
        return validated_telemetry


class EmergencyValidator:
    """
    Validador para emergências
    """
    
    @classmethod
    def validate_emergency_parameters(cls, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida parâmetros de emergência
        
        Args:
            params: Parâmetros da emergência
            
        Returns:
            Dict[str, Any]: Parâmetros validados
        """
        validated = {}
        
        # Validar descrição
        if 'descricao' in params:
            descricao = params['descricao'].strip()
            if len(descricao) < 10:
                raise EmergencyValidationError("Descrição da emergência deve ter pelo menos 10 caracteres")
            if len(descricao) > 1000:
                raise EmergencyValidationError("Descrição da emergência deve ter no máximo 1000 caracteres")
            validated['descricao'] = descricao
        
        # Validar gravidade
        if 'gravidade' in params:
            gravidade = params['gravidade']
            if isinstance(gravidade, int):
                if not (1 <= gravidade <= 4):
                    raise EmergencyValidationError("Gravidade deve estar entre 1 e 4")
                validated['gravidade'] = GravidadeEmergencia(gravidade)
            elif isinstance(gravidade, GravidadeEmergencia):
                validated['gravidade'] = gravidade
            else:
                raise EmergencyValidationError("Gravidade deve ser um inteiro ou GravidadeEmergencia")
        
        # Validar tipo de emergência
        if 'tipo_emergencia' in params and params['tipo_emergencia'] is not None:
            tipo = params['tipo_emergencia'].strip()
            if len(tipo) == 0:
                raise EmergencyValidationError("Tipo de emergência não pode estar vazio")
            validated['tipo_emergencia'] = tipo
        
        return validated
    
    @classmethod
    def validate_emergency_severity(cls, severity: Union[int, GravidadeEmergencia]) -> GravidadeEmergencia:
        """
        Valida gravidade da emergência
        
        Args:
            severity: Gravidade da emergência
            
        Returns:
            GravidadeEmergencia: Gravidade validada
        """
        if isinstance(severity, int):
            if not (1 <= severity <= 4):
                raise EmergencyValidationError("Gravidade deve estar entre 1 e 4")
            return GravidadeEmergencia(severity)
        elif isinstance(severity, GravidadeEmergencia):
            return severity
        else:
            raise EmergencyValidationError("Gravidade deve ser um inteiro ou GravidadeEmergencia")


class WebSocketValidator:
    """
    Validador para mensagens WebSocket
    """
    
    @classmethod
    def validate_websocket_message(cls, message: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida mensagem WebSocket
        
        Args:
            message: Mensagem WebSocket
            
        Returns:
            Dict[str, Any]: Mensagem validada
        """
        if not isinstance(message, dict):
            raise ValidationError("Mensagem WebSocket deve ser um dicionário")
        
        if 'type' not in message:
            raise ValidationError("Mensagem WebSocket deve conter campo 'type'")
        
        message_type = message['type']
        if not isinstance(message_type, str):
            raise ValidationError("Tipo da mensagem WebSocket deve ser uma string")
        
        # Validar tipos conhecidos
        valid_types = [
            'ping', 'pong', 'subscribe', 'get_connection_stats',
            'simulation_command', 'digital_twin_command', 'emergency_alert',
            'simulation_update', 'emergency_broadcast'
        ]
        
        if message_type not in valid_types:
            raise ValidationError(f"Tipo de mensagem WebSocket inválido: {message_type}")
        
        # Validações específicas por tipo
        if message_type == 'simulation_command':
            cls._validate_simulation_command(message)
        elif message_type == 'digital_twin_command':
            cls._validate_digital_twin_command(message)
        elif message_type == 'emergency_alert':
            cls._validate_emergency_alert(message)
        
        return message
    
    @classmethod
    def _validate_simulation_command(cls, message: Dict[str, Any]):
        """Valida comando de simulação"""
        if 'command' not in message:
            raise ValidationError("Comando de simulação deve conter campo 'command'")
        
        valid_commands = ['pause', 'resume', 'restart', 'stop', 'status']
        if message['command'] not in valid_commands:
            raise ValidationError(f"Comando de simulação inválido: {message['command']}")
    
    @classmethod
    def _validate_digital_twin_command(cls, message: Dict[str, Any]):
        """Valida comando de Digital Twin"""
        if 'command' not in message:
            raise ValidationError("Comando de Digital Twin deve conter campo 'command'")
        
        valid_commands = ['sync', 'update', 'predict', 'status']
        if message['command'] not in valid_commands:
            raise ValidationError(f"Comando de Digital Twin inválido: {message['command']}")
    
    @classmethod
    def _validate_emergency_alert(cls, message: Dict[str, Any]):
        """Valida alerta de emergência"""
        if 'emergency_type' not in message:
            raise ValidationError("Alerta de emergência deve conter campo 'emergency_type'")
        
        if 'severity' in message:
            EmergencyValidator.validate_emergency_severity(message['severity'])


class ExportValidator:
    """
    Validador para operações de exportação
    """
    
    @classmethod
    def validate_export_parameters(cls, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida parâmetros de exportação
        
        Args:
            params: Parâmetros de exportação
            
        Returns:
            Dict[str, Any]: Parâmetros validados
        """
        validated = {}
        
        # Validar formato
        if 'formato' in params:
            formato = params['formato'].lower()
            valid_formats = ['json', 'csv', 'xml']
            if formato not in valid_formats:
                raise ValidationError(f"Formato de exportação inválido: {formato}")
            validated['formato'] = formato
        
        # Validar que pelo menos um ID foi fornecido
        if 'simulacao_id' not in params and 'digital_twin_id' not in params:
            raise ValidationError("Pelo menos um ID (simulacao_id ou digital_twin_id) deve ser fornecido")
        
        # Validar IDs se fornecidos
        if 'simulacao_id' in params and params['simulacao_id'] is not None:
            if not isinstance(params['simulacao_id'], str) or len(params['simulacao_id'].strip()) == 0:
                raise ValidationError("ID da simulação deve ser uma string não vazia")
            validated['simulacao_id'] = params['simulacao_id'].strip()
        
        if 'digital_twin_id' in params and params['digital_twin_id'] is not None:
            validated['digital_twin_id'] = DigitalTwinValidator.validate_asset_id(params['digital_twin_id'])
        
        return validated


# Funções utilitárias de validação
def validate_coordinates(x: float, y: float, z: Optional[float] = None) -> Tuple[float, ...]:
    """
    Valida coordenadas espaciais
    
    Args:
        x: Coordenada X
        y: Coordenada Y
        z: Coordenada Z (opcional)
        
    Returns:
        Tuple[float, ...]: Coordenadas validadas
    """
    x = float(x)
    y = float(y)
    
    if not math.isfinite(x) or not math.isfinite(y):
        raise PhysicsValidationError("Coordenadas devem ser números finitos")
    
    if z is not None:
        z = float(z)
        if not math.isfinite(z):
            raise PhysicsValidationError("Coordenada Z deve ser um número finito")
        return (x, y, z)
    
    return (x, y)


def validate_timestamp(timestamp: Union[str, int, float]) -> datetime:
    """
    Valida e converte timestamp
    
    Args:
        timestamp: Timestamp como string ISO, int ou float
        
    Returns:
        datetime: Objeto datetime
    """
    if isinstance(timestamp, (int, float)):
        # Assumir timestamp Unix
        if timestamp <= 0:
            raise ValidationError("Timestamp deve ser positivo")
        return datetime.fromtimestamp(timestamp)
    elif isinstance(timestamp, str):
        try:
            # Tentar converter string ISO
            return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except ValueError:
            raise ValidationError(f"Timestamp em formato inválido: {timestamp}")
    else:
        raise ValidationError("Timestamp deve ser numérico ou string ISO")


def validate_percentage(value: float, context: str = "") -> float:
    """
    Valida porcentagem (0-100)
    
    Args:
        value: Valor da porcentagem
        context: Contexto para mensagens de erro
        
    Returns:
        float: Porcentagem validada
    """
    if not isinstance(value, (int, float)):
        raise ValidationError(f"{context}Porcentagem deve ser um número")
    
    if value < 0 or value > 100:
        raise ValidationError(f"{context}Porcentagem deve estar entre 0 e 100: {value:.2f}")
    
    return float(value)


# Validador principal
class SystemValidator:
    """
    Validador principal do sistema que agrega todas as validações
    """
    
    @classmethod
    def validate_simulation_request(cls, request_data: Dict[str, Any], simulation_type: TipoSimulacao) -> Dict[str, Any]:
        """Valida requisição de simulação"""
        return SimulationValidator.validate_simulation_parameters(request_data, simulation_type)
    
    @classmethod
    def validate_digital_twin_request(cls, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Valida requisição de Digital Twin"""
        validated = {}
        
        if 'asset_id' in request_data:
            validated['asset_id'] = DigitalTwinValidator.validate_asset_id(request_data['asset_id'])
        
        if 'parametros_iniciais' in request_data:
            validated['parametros_iniciais'] = DigitalTwinValidator.validate_twin_parameters(
                request_data['parametros_iniciais']
            )
        
        return validated
    
    @classmethod
    def validate_emergency_request(cls, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Valida requisição de emergência"""
        return EmergencyValidator.validate_emergency_parameters(request_data)
    
    @classmethod
    def validate_export_request(cls, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Valida requisição de exportação"""
        return ExportValidator.validate_export_parameters(request_data)
    
    @classmethod
    def validate_websocket_message(cls, message: Dict[str, Any]) -> Dict[str, Any]:
        """Valida mensagem WebSocket"""
        return WebSocketValidator.validate_websocket_message(message)


# Instância global para uso fácil
validator = SystemValidator()