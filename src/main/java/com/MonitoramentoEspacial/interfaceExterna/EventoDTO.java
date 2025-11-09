package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.dominio.TipoEvento;
import java.time.LocalDateTime;

public record EventoDTO(
    Long id,
    Long missaoId, // Adicionado para referência, embora o frontend não use
    LocalDateTime timestamp,
    TipoEvento tipo,
    String descricao
) {
}