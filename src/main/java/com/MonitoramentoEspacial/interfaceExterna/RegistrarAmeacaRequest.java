package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.dominio.TipoAmeaca;
import jakarta.validation.constraints.*;

public record RegistrarAmeacaRequest(
    @NotNull(message = "ID da missão é obrigatório")
    Long missaoId,

    @NotNull(message = "Tipo da ameaça é obrigatório")
    TipoAmeaca tipo,

    @NotBlank(message = "Descrição é obrigatória")
    String descricao,

    @Min(1) @Max(10)
    int nivelPerigo,

    @PositiveOrZero
    double distanciaKm
) {}