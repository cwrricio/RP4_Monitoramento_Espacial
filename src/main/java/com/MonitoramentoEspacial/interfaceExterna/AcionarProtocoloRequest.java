package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.dominio.TipoProtocolo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AcionarProtocoloRequest(
    
    @NotNull(message = "O tipo de protocolo é obrigatório")
    TipoProtocolo tipo,

    @NotBlank(message = "A descrição não pode ser vazia")
    String descricao
) {
}