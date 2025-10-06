package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.Missao;
import com.MonitoramentoEspacial.interfaceExterna.MissaoDTO;

import java.util.stream.Collectors;

public class MissaoMapper {
     public static MissaoDTO toDTO(Missao missao) {
        return new MissaoDTO(
            missao.getId(),
            missao.getNome(),
            missao.getObjetivo(),
            missao.getDataInicio(),
            missao.getDataFim(),
            missao.getStatus(),
            missao.getTripulacao().stream()
                .map(Astronauta::getId)
                .collect(Collectors.toList())
        );
    }
}

