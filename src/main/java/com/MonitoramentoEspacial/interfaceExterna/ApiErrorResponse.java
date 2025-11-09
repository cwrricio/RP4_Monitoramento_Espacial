package com.MonitoramentoEspacial.interfaceExterna;

import java.time.Instant;

/**
 * DTO padrão para respostas de erro da API.
 */
public record ApiErrorResponse(
    int status,
    String error,
    String message,
    Instant timestamp
) {
}