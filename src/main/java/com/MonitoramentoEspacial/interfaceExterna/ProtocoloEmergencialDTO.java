package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.dominio.TipoProtocolo;
import java.time.LocalDateTime;

public record ProtocoloEmergencialDTO(
    Long id,
    Long missaoId, 
    TipoProtocolo tipo,
    String descricao,
    LocalDateTime acionadoEm
) {
}