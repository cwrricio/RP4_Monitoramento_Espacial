package com.MonitoramentoEspacial.aplicacao;

/**
 * Exceção personalizada para tratar erros de recursos não encontrados
 * no sistema de monitoramento espacial.
 */
public class RecursoNaoEncontradoException extends RuntimeException {

    /**
     * Construtor padrão da exceção
     */
    public RecursoNaoEncontradoException() {
        super();
    }

    /**
     * Construtor com mensagem de erro
     * @param message mensagem descritiva do erro
     */
    public RecursoNaoEncontradoException(String message) {
        super(message);
    }

    /**
     * Construtor com mensagem de erro e causa
     * @param message mensagem descritiva do erro
     * @param cause exceção que causou este erro
     */
    public RecursoNaoEncontradoException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Construtor apenas com a causa
     * @param cause exceção que causou este erro
     */
    public RecursoNaoEncontradoException(Throwable cause) {
        super(cause);
    }
}
