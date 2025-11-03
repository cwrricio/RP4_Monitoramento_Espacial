package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.OperadorDeMissao;
import com.MonitoramentoEspacial.interfaceExterna.OperadorDeMissaoDTO;

public class OperadorDeMissaoMapper {
    
    public static OperadorDeMissaoDTO toDTO(OperadorDeMissao operador) {
        return new OperadorDeMissaoDTO(
            operador.getId(),
            operador.getNome(),
            operador.getIdade(),
            operador.isAtivo(),
            operador.getTurno(),
            operador.getAreaEspecializacao()
        );
    }
}