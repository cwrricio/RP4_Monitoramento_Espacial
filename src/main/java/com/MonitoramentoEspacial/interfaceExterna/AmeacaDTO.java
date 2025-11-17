package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.dominio.TipoAmeaca;
import java.time.LocalDateTime;

public record AmeacaDTO(
    Long id,
    Long missaoId,
    TipoAmeaca tipo,
    String descricao,
    int nivelPerigo,
    double distanciaKm,
    LocalDateTime detectadaEm
) {}