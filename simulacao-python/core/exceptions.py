# core/exceptions.py
"""
Sistema centralizado de exceções personalizadas para o sistema de simulação
Hierarquia organizada de exceções para tratamento específico de erros
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
import logging
import traceback


class SimulationBaseError(Exception):
    """
    Classe base para todas as exceções do sistema de simulação
    Fornece funcionalidades comuns como logging e serialização
    """
    
    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        original_exception: Optional[Exception] = None
    ):
        """
        Inicializa a exceção base
        
        Args:
            message: Mensagem de erro descritiva
            error_code: Código único do erro para identificação
            details: Detalhes adicionais do erro
            original_exception: Exceção original que causou este erro
        """
        self.message = message
        self.error_code = error_code or "UNKNOWN_ERROR"
        self.details = details or {}
        self.original_exception = original_exception
        self.timestamp = datetime.now()
        self.stack_trace = traceback.format_exc()
        
        # Adicionar informações padrão
        self.details.update({
            "timestamp": self.timestamp.isoformat(),
            "error_code": self.error_code
        })
        
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Serializa a exceção para dicionário (útil para APIs)
        
        Returns:
            Dict[str, Any]: Exceção serializada
        """
        result = {
            "error": self.__class__.__name__,
            "message": self.message,
            "error_code": self.error_code,
            "timestamp": self.timestamp.isoformat(),
            "details": self.details
        }
        
        if self.original_exception:
            result["original_exception"] = str(self.original_exception)
        
        return result
    
    def log_error(self, logger: Optional[logging.Logger] = None):
        """
        Registra o erro no logger especificado
        
        Args:
            logger: Logger para registrar o erro (usa root logger se None)
        """
        logger = logger or logging.getLogger()
        
        log_message = f"{self.error_code}: {self.message}"
        if self.details:
            log_message += f" | Details: {self.details}"
        
        logger.error(log_message, exc_info=True)
    
    def __str__(self) -> str:
        """
        Representação em string da exceção
        """
        base_str = f"{self.__class__.__name__}: {self.message} (Code: {self.error_code})"
        
        if self.details:
            details_str = ", ".join(f"{k}={v}" for k, v in self.details.items())
            base_str += f" | Details: {details_str}"
        
        return base_str


# =============================================================================
# EXCEÇÕES DE SIMULAÇÃO
# =============================================================================

class SimulationError(SimulationBaseError):
    """Exceção base para erros relacionados a simulações"""
    pass


class SimulationValidationError(SimulationError):
    """
    Exceção para erros de validação de parâmetros de simulação
    """
    
    def __init__(
        self,
        message: str,
        invalid_parameters: Optional[Dict[str, Any]] = None,
        validation_errors: Optional[List[str]] = None,
        **kwargs
    ):
        """
        Inicializa erro de validação de simulação
        
        Args:
            message: Mensagem de erro
            invalid_parameters: Parâmetros inválidos
            validation_errors: Lista de erros de validação
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "invalid_parameters": invalid_parameters or {},
            "validation_errors": validation_errors or []
        })
        
        super().__init__(
            message=message,
            error_code="SIMULATION_VALIDATION_ERROR",
            details=details,
            **kwargs
        )


class SimulationConfigurationError(SimulationError):
    """
    Exceção para erros de configuração de simulação
    """
    
    def __init__(
        self,
        message: str,
        configuration_key: Optional[str] = None,
        expected_value: Optional[Any] = None,
        actual_value: Optional[Any] = None,
        **kwargs
    ):
        """
        Inicializa erro de configuração de simulação
        
        Args:
            message: Mensagem de erro
            configuration_key: Chave de configuração problemática
            expected_value: Valor esperado
            actual_value: Valor atual
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "configuration_key": configuration_key,
            "expected_value": expected_value,
            "actual_value": actual_value
        })
        
        super().__init__(
            message=message,
            error_code="SIMULATION_CONFIGURATION_ERROR",
            details=details,
            **kwargs
        )


class SimulationExecutionError(SimulationError):
    """
    Exceção para erros durante a execução da simulação
    """
    
    def __init__(
        self,
        message: str,
        simulation_id: Optional[str] = None,
        simulation_type: Optional[str] = None,
        execution_step: Optional[str] = None,
        **kwargs
    ):
        """
        Inicializa erro de execução de simulação
        
        Args:
            message: Mensagem de erro
            simulation_id: ID da simulação
            simulation_type: Tipo da simulação
            execution_step: Etapa da execução onde ocorreu o erro
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "simulation_id": simulation_id,
            "simulation_type": simulation_type,
            "execution_step": execution_step
        })
        
        super().__init__(
            message=message,
            error_code="SIMULATION_EXECUTION_ERROR",
            details=details,
            **kwargs
        )


class SimulationDataError(SimulationError):
    """
    Exceção para erros relacionados a dados de simulação
    """
    
    def __init__(
        self,
        message: str,
        data_type: Optional[str] = None,
        data_source: Optional[str] = None,
        data_quality: Optional[str] = None,
        **kwargs
    ):
        """
        Inicializa erro de dados de simulação
        
        Args:
            message: Mensagem de erro
            data_type: Tipo de dados problemático
            data_source: Fonte dos dados
            data_quality: Qualidade dos dados
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "data_type": data_type,
            "data_source": data_source,
            "data_quality": data_quality
        })
        
        super().__init__(
            message=message,
            error_code="SIMULATION_DATA_ERROR",
            details=details,
            **kwargs
        )


class SimulationTimeoutError(SimulationError):
    """
    Exceção para timeouts em simulações
    """
    
    def __init__(
        self,
        message: str,
        timeout_duration: Optional[float] = None,
        simulation_progress: Optional[float] = None,
        **kwargs
    ):
        """
        Inicializa erro de timeout de simulação
        
        Args:
            message: Mensagem de erro
            timeout_duration: Duração do timeout em segundos
            simulation_progress: Progresso da simulação no momento do timeout
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "timeout_duration": timeout_duration,
            "simulation_progress": simulation_progress
        })
        
        super().__init__(
            message=message,
            error_code="SIMULATION_TIMEOUT_ERROR",
            details=details,
            **kwargs
        )


# =============================================================================
# EXCEÇÕES DE EMERGÊNCIA
# =============================================================================

class EmergencyError(SimulationBaseError):
    """Exceção base para erros relacionados a emergências"""
    pass


class EmergencyDetectionError(EmergencyError):
    """
    Exceção para erros na detecção de emergências
    """
    
    def __init__(
        self,
        message: str,
        emergency_type: Optional[str] = None,
        detection_rule: Optional[str] = None,
        sensor_data: Optional[Dict[str, Any]] = None,
        **kwargs
    ):
        """
        Inicializa erro de detecção de emergência
        
        Args:
            message: Mensagem de erro
            emergency_type: Tipo de emergência
            detection_rule: Regra de detecção que falhou
            sensor_data: Dados do sensor no momento do erro
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "emergency_type": emergency_type,
            "detection_rule": detection_rule,
            "sensor_data": sensor_data or {}
        })
        
        super().__init__(
            message=message,
            error_code="EMERGENCY_DETECTION_ERROR",
            details=details,
            **kwargs
        )


class EmergencyProtocolError(EmergencyError):
    """
    Exceção para erros na execução de protocolos de emergência
    """
    
    def __init__(
        self,
        message: str,
        protocol_id: Optional[str] = None,
        protocol_step: Optional[str] = None,
        emergency_id: Optional[str] = None,
        **kwargs
    ):
        """
        Inicializa erro de protocolo de emergência
        
        Args:
            message: Mensagem de erro
            protocol_id: ID do protocolo
            protocol_step: Etapa do protocolo que falhou
            emergency_id: ID da emergência relacionada
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "protocol_id": protocol_id,
            "protocol_step": protocol_step,
            "emergency_id": emergency_id
        })
        
        super().__init__(
            message=message,
            error_code="EMERGENCY_PROTOCOL_ERROR",
            details=details,
            **kwargs
        )


class EmergencyResolutionError(EmergencyError):
    """
    Exceção para erros na resolução de emergências
    """
    
    def __init__(
        self,
        message: str,
        emergency_id: Optional[str] = None,
        resolution_attempts: Optional[int] = None,
        resolution_time: Optional[float] = None,
        **kwargs
    ):
        """
        Inicializa erro de resolução de emergência
        
        Args:
            message: Mensagem de erro
            emergency_id: ID da emergência
            resolution_attempts: Número de tentativas de resolução
            resolution_time: Tempo gasto na resolução
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "emergency_id": emergency_id,
            "resolution_attempts": resolution_attempts,
            "resolution_time": resolution_time
        })
        
        super().__init__(
            message=message,
            error_code="EMERGENCY_RESOLUTION_ERROR",
            details=details,
            **kwargs
        )


# =============================================================================
# EXCEÇÕES DE DIGITAL TWINS
# =============================================================================

class DigitalTwinError(SimulationBaseError):
    """Exceção base para erros relacionados a Digital Twins"""
    pass


class DigitalTwinNotFoundError(DigitalTwinError):
    """
    Exceção para Digital Twin não encontrado
    """
    
    def __init__(
        self,
        message: str,
        twin_id: Optional[str] = None,
        asset_id: Optional[str] = None,
        **kwargs
    ):
        """
        Inicializa erro de Digital Twin não encontrado
        
        Args:
            message: Mensagem de erro
            twin_id: ID do Digital Twin
            asset_id: ID do ativo físico
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "twin_id": twin_id,
            "asset_id": asset_id
        })
        
        super().__init__(
            message=message,
            error_code="DIGITAL_TWIN_NOT_FOUND",
            details=details,
            **kwargs
        )


class DigitalTwinSyncError(DigitalTwinError):
    """
    Exceção para erros de sincronização de Digital Twin
    """
    
    def __init__(
        self,
        message: str,
        twin_id: Optional[str] = None,
        sync_operation: Optional[str] = None,
        data_discrepancy: Optional[Dict[str, Any]] = None,
        **kwargs
    ):
        """
        Inicializa erro de sincronização de Digital Twin
        
        Args:
            message: Mensagem de erro
            twin_id: ID do Digital Twin
            sync_operation: Operação de sincronização que falhou
            data_discrepancy: Discrepâncias de dados encontradas
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "twin_id": twin_id,
            "sync_operation": sync_operation,
            "data_discrepancy": data_discrepancy or {}
        })
        
        super().__init__(
            message=message,
            error_code="DIGITAL_TWIN_SYNC_ERROR",
            details=details,
            **kwargs
        )


class DigitalTwinStateError(DigitalTwinError):
    """
    Exceção para erros de estado do Digital Twin
    """
    
    def __init__(
        self,
        message: str,
        twin_id: Optional[str] = None,
        current_state: Optional[str] = None,
        expected_state: Optional[str] = None,
        **kwargs
    ):
        """
        Inicializa erro de estado do Digital Twin
        
        Args:
            message: Mensagem de erro
            twin_id: ID do Digital Twin
            current_state: Estado atual
            expected_state: Estado esperado
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "twin_id": twin_id,
            "current_state": current_state,
            "expected_state": expected_state
        })
        
        super().__init__(
            message=message,
            error_code="DIGITAL_TWIN_STATE_ERROR",
            details=details,
            **kwargs
        )


# =============================================================================
# EXCEÇÕES DE WEBSOCKET E COMUNICAÇÃO
# =============================================================================

class CommunicationError(SimulationBaseError):
    """Exceção base para erros de comunicação"""
    pass


class WebSocketError(CommunicationError):
    """
    Exceção para erros relacionados a WebSocket
    """
    
    def __init__(
        self,
        message: str,
        client_id: Optional[str] = None,
        connection_status: Optional[str] = None,
        message_type: Optional[str] = None,
        **kwargs
    ):
        """
        Inicializa erro de WebSocket
        
        Args:
            message: Mensagem de erro
            client_id: ID do cliente WebSocket
            connection_status: Status da conexão
            message_type: Tipo de mensagem problemática
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "client_id": client_id,
            "connection_status": connection_status,
            "message_type": message_type
        })
        
        super().__init__(
            message=message,
            error_code="WEBSOCKET_ERROR",
            details=details,
            **kwargs
        )


class WebSocketConnectionError(WebSocketError):
    """
    Exceção para erros de conexão WebSocket
    """
    
    def __init__(
        self,
        message: str,
        client_id: Optional[str] = None,
        connection_attempts: Optional[int] = None,
        **kwargs
    ):
        """
        Inicializa erro de conexão WebSocket
        
        Args:
            message: Mensagem de erro
            client_id: ID do cliente
            connection_attempts: Número de tentativas de conexão
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "client_id": client_id,
            "connection_attempts": connection_attempts
        })
        
        super().__init__(
            message=message,
            error_code="WEBSOCKET_CONNECTION_ERROR",
            details=details,
            **kwargs
        )


class MessageProcessingError(CommunicationError):
    """
    Exceção para erros no processamento de mensagens
    """
    
    def __init__(
        self,
        message: str,
        message_content: Optional[Dict[str, Any]] = None,
        processing_step: Optional[str] = None,
        **kwargs
    ):
        """
        Inicializa erro de processamento de mensagem
        
        Args:
            message: Mensagem de erro
            message_content: Conteúdo da mensagem problemática
            processing_step: Etapa do processamento que falhou
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "message_content": message_content or {},
            "processing_step": processing_step
        })
        
        super().__init__(
            message=message,
            error_code="MESSAGE_PROCESSING_ERROR",
            details=details,
            **kwargs
        )


# =============================================================================
# EXCEÇÕES DE VALIDAÇÃO E CONFIGURAÇÃO
# =============================================================================

class ValidationError(SimulationBaseError):
    """Exceção base para erros de validação"""
    pass


class ConfigurationError(SimulationBaseError):
    """Exceção base para erros de configuração"""
    pass


class ParameterValidationError(ValidationError):
    """
    Exceção para erros de validação de parâmetros
    """
    
    def __init__(
        self,
        message: str,
        parameter_name: Optional[str] = None,
        parameter_value: Optional[Any] = None,
        validation_rules: Optional[List[str]] = None,
        **kwargs
    ):
        """
        Inicializa erro de validação de parâmetro
        
        Args:
            message: Mensagem de erro
            parameter_name: Nome do parâmetro inválido
            parameter_value: Valor do parâmetro
            validation_rules: Regras de validação que falharam
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "parameter_name": parameter_name,
            "parameter_value": parameter_value,
            "validation_rules": validation_rules or []
        })
        
        super().__init__(
            message=message,
            error_code="PARAMETER_VALIDATION_ERROR",
            details=details,
            **kwargs
        )


class DataValidationError(ValidationError):
    """
    Exceção para erros de validação de dados
    """
    
    def __init__(
        self,
        message: str,
        data_type: Optional[str] = None,
        data_source: Optional[str] = None,
        validation_criteria: Optional[List[str]] = None,
        **kwargs
    ):
        """
        Inicializa erro de validação de dados
        
        Args:
            message: Mensagem de erro
            data_type: Tipo de dados
            data_source: Fonte dos dados
            validation_criteria: Critérios de validação que falharam
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "data_type": data_type,
            "data_source": data_source,
            "validation_criteria": validation_criteria or []
        })
        
        super().__init__(
            message=message,
            error_code="DATA_VALIDATION_ERROR",
            details=details,
            **kwargs
        )


# =============================================================================
# EXCEÇÕES DE SERVIÇOS E INFRAESTRUTURA
# =============================================================================

class ServiceError(SimulationBaseError):
    """Exceção base para erros de serviços"""
    pass


class ServiceUnavailableError(ServiceError):
    """
    Exceção para serviços indisponíveis
    """
    
    def __init__(
        self,
        message: str,
        service_name: Optional[str] = None,
        retry_after: Optional[int] = None,
        **kwargs
    ):
        """
        Inicializa erro de serviço indisponível
        
        Args:
            message: Mensagem de erro
            service_name: Nome do serviço
            retry_after: Segundos para tentar novamente
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "service_name": service_name,
            "retry_after": retry_after
        })
        
        super().__init__(
            message=message,
            error_code="SERVICE_UNAVAILABLE_ERROR",
            details=details,
            **kwargs
        )


class ResourceExhaustedError(ServiceError):
    """
    Exceção para recursos esgotados
    """
    
    def __init__(
        self,
        message: str,
        resource_type: Optional[str] = None,
        current_usage: Optional[float] = None,
        max_limit: Optional[float] = None,
        **kwargs
    ):
        """
        Inicializa erro de recurso esgotado
        
        Args:
            message: Mensagem de erro
            resource_type: Tipo de recurso
            current_usage: Uso atual
            max_limit: Limite máximo
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "resource_type": resource_type,
            "current_usage": current_usage,
            "max_limit": max_limit
        })
        
        super().__init__(
            message=message,
            error_code="RESOURCE_EXHAUSTED_ERROR",
            details=details,
            **kwargs
        )


class DatabaseError(ServiceError):
    """
    Exceção para erros de banco de dados
    """
    
    def __init__(
        self,
        message: str,
        operation: Optional[str] = None,
        table: Optional[str] = None,
        query: Optional[str] = None,
        **kwargs
    ):
        """
        Inicializa erro de banco de dados
        
        Args:
            message: Mensagem de erro
            operation: Operação que falhou
            table: Tabela envolvida
            query: Query problemática
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "operation": operation,
            "table": table,
            "query": query
        })
        
        super().__init__(
            message=message,
            error_code="DATABASE_ERROR",
            details=details,
            **kwargs
        )


# =============================================================================
# EXCEÇÕES DE SEGURANÇA E AUTORIZAÇÃO
# =============================================================================

class SecurityError(SimulationBaseError):
    """Exceção base para erros de segurança"""
    pass


class AuthenticationError(SecurityError):
    """
    Exceção para erros de autenticação
    """
    
    def __init__(
        self,
        message: str,
        user_id: Optional[str] = None,
        auth_method: Optional[str] = None,
        **kwargs
    ):
        """
        Inicializa erro de autenticação
        
        Args:
            message: Mensagem de erro
            user_id: ID do usuário
            auth_method: Método de autenticação
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "user_id": user_id,
            "auth_method": auth_method
        })
        
        super().__init__(
            message=message,
            error_code="AUTHENTICATION_ERROR",
            details=details,
            **kwargs
        )


class AuthorizationError(SecurityError):
    """
    Exceção para erros de autorização
    """
    
    def __init__(
        self,
        message: str,
        user_id: Optional[str] = None,
        required_permission: Optional[str] = None,
        resource: Optional[str] = None,
        **kwargs
    ):
        """
        Inicializa erro de autorização
        
        Args:
            message: Mensagem de erro
            user_id: ID do usuário
            required_permission: Permissão necessária
            resource: Recurso acessado
            **kwargs: Argumentos adicionais para a base
        """
        details = kwargs.pop('details', {})
        details.update({
            "user_id": user_id,
            "required_permission": required_permission,
            "resource": resource
        })
        
        super().__init__(
            message=message,
            error_code="AUTHORIZATION_ERROR",
            details=details,
            **kwargs
        )


# =============================================================================
# UTILITÁRIOS E FUNÇÕES AUXILIARES
# =============================================================================

def create_simulation_error(
    error_type: str,
    message: str,
    **kwargs
) -> SimulationBaseError:
    """
    Fábrica para criação de exceções de simulação
    
    Args:
        error_type: Tipo do erro (simulation, validation, etc.)
        message: Mensagem de erro
        **kwargs: Argumentos adicionais para a exceção
        
    Returns:
        SimulationBaseError: Exceção criada
        
    Raises:
        ValueError: Se o tipo de erro for desconhecido
    """
    error_factories = {
        "simulation": SimulationError,
        "validation": SimulationValidationError,
        "configuration": SimulationConfigurationError,
        "execution": SimulationExecutionError,
        "data": SimulationDataError,
        "timeout": SimulationTimeoutError,
        "emergency": EmergencyError,
        "digital_twin": DigitalTwinError,
        "websocket": WebSocketError,
        "validation_general": ValidationError,
        "service": ServiceError,
        "security": SecurityError
    }
    
    factory = error_factories.get(error_type)
    if not factory:
        raise ValueError(f"Tipo de erro desconhecido: {error_type}")
    
    return factory(message, **kwargs)


def handle_exception(
    exception: Exception,
    context: Optional[Dict[str, Any]] = None,
    logger: Optional[logging.Logger] = None
) -> SimulationBaseError:
    """
    Converte uma exceção genérica em uma exceção do sistema
    
    Args:
        exception: Exceção original
        context: Contexto adicional do erro
        logger: Logger para registrar o erro
        
    Returns:
        SimulationBaseError: Exceção convertida do sistema
    """
    context = context or {}
    
    # Se já for uma exceção do sistema, apenas adiciona contexto
    if isinstance(exception, SimulationBaseError):
        if context:
            exception.details.update(context)
        return exception
    
    # Converter exceções comuns em exceções do sistema
    if isinstance(exception, ValueError):
        wrapped_error = ValidationError(
            message=str(exception),
            original_exception=exception,
            details=context
        )
    elif isinstance(exception, TypeError):
        wrapped_error = ValidationError(
            message=f"Erro de tipo: {str(exception)}",
            original_exception=exception,
            details=context
        )
    elif isinstance(exception, TimeoutError):
        wrapped_error = SimulationTimeoutError(
            message=f"Timeout: {str(exception)}",
            original_exception=exception,
            details=context
        )
    elif isinstance(exception, ConnectionError):
        wrapped_error = WebSocketConnectionError(
            message=f"Erro de conexão: {str(exception)}",
            original_exception=exception,
            details=context
        )
    elif isinstance(exception, PermissionError):
        wrapped_error = AuthorizationError(
            message=f"Erro de permissão: {str(exception)}",
            original_exception=exception,
            details=context
        )
    else:
        # Exceção genérica
        wrapped_error = SimulationError(
            message=f"Erro inesperado: {str(exception)}",
            original_exception=exception,
            details=context
        )
    
    # Registrar o erro
    if logger:
        wrapped_error.log_error(logger)
    
    return wrapped_error


def is_retryable_error(error: SimulationBaseError) -> bool:
    """
    Verifica se um erro é recuperável (pode ser tentado novamente)
    
    Args:
        error: Exceção a verificar
        
    Returns:
        bool: True se o erro é recuperável
    """
    retryable_errors = {
        "SERVICE_UNAVAILABLE_ERROR",
        "WEBSOCKET_CONNECTION_ERROR",
        "RESOURCE_EXHAUSTED_ERROR",  # Após esperar
        "SIMULATION_TIMEOUT_ERROR"   # Com ajustes
    }
    
    return error.error_code in retryable_errors


def should_alert_team(error: SimulationBaseError) -> bool:
    """
    Verifica se um erro deve gerar alerta para a equipe
    
    Args:
        error: Exceção a verificar
        
    Returns:
        bool: True se deve alertar a equipe
    """
    critical_errors = {
        "SIMULATION_EXECUTION_ERROR",
        "EMERGENCY_DETECTION_ERROR",
        "EMERGENCY_PROTOCOL_ERROR",
        "DIGITAL_TWIN_SYNC_ERROR",
        "AUTHENTICATION_ERROR",
        "AUTHORIZATION_ERROR",
        "FALHA_SISTEMA"
    }
    
    return error.error_code in critical_errors


# Context manager para tratamento seguro de exceções
class ErrorHandler:
    """
    Context manager para tratamento consistente de exceções
    """
    
    def __init__(
        self,
        operation_name: str,
        logger: Optional[logging.Logger] = None,
        re_raise: bool = True,
        default_return: Any = None
    ):
        """
        Inicializa o handler de erro
        
        Args:
            operation_name: Nome da operação para logging
            logger: Logger para registrar erros
            re_raise: Se deve relançar a exceção
            default_return: Valor padrão a retornar em caso de erro
        """
        self.operation_name = operation_name
        self.logger = logger
        self.re_raise = re_raise
        self.default_return = default_return
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_val is not None:
            # Converter e tratar a exceção
            context = {
                "operation": self.operation_name,
                "context_manager": "ErrorHandler"
            }
            
            handled_error = handle_exception(exc_val, context, self.logger)
            
            if self.re_raise:
                # Substituir a exceção original pela tratada
                raise handled_error from exc_val
            else:
                # Apenas logar e continuar
                return True  # Suprime a exceção
        
        return False  # Propaga a exceção se não houve erro