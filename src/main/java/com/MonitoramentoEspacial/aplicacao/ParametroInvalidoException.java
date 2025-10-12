package com.MonitoramentoEspacial.aplicacao;

/**
 * Exceção personalizada para tratar erros de parâmetros inválidos
 * no sistema de monitoramento espacial.
 */
public class ParametroInvalidoException extends RuntimeException {

    /**
     * Construtor padrão da exceção
     */
    public ParametroInvalidoException() {
        super();
    }

    /**
     * Construtor com mensagem de erro
     * @param message mensagem descritiva do erro
     */
    public ParametroInvalidoException(String message) {
        super(message);
    }

    /**
     * Construtor com mensagem de erro e causa
     * @param message mensagem descritiva do erro
     * @param cause exceção que causou este erro
     */
    public ParametroInvalidoException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Construtor apenas com a causa
     * @param cause exceção que causou este erro
     */
    public ParametroInvalidoException(Throwable cause) {
        super(cause);
    }
}
