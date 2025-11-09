package com.MonitoramentoEspacial.config;

import com.MonitoramentoEspacial.aplicacao.RecursoNaoEncontradoException;
import com.MonitoramentoEspacial.interfaceExterna.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;

/**
 * Handler de Exceções Global.
 * Captura exceções de negócio e as traduz em respostas HTTP apropriadas.
 */
@ControllerAdvice
public class RestExceptionHandler {

    /**
     * Trata a exceção RecursoNaoEncontradoException lançada por qualquer Service.
     *
     * @param ex A exceção capturada.
     * @param request O contexto da requisição.
     * @return Um ResponseEntity com status 404 e um corpo JSON padronizado.
     */
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ApiErrorResponse> handleRecursoNaoEncontrado(
            RecursoNaoEncontradoException ex, WebRequest request) {

        ApiErrorResponse errorResponse = new ApiErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Recurso Não Encontrado",
                ex.getMessage(),
                Instant.now()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }
}