package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.OperadorDeMissao;
import com.MonitoramentoEspacial.interfaceExterna.CriarOperadorRequest;

public class OperadorDeMissaoFactory {
    
    public static OperadorDeMissao fromRequest(CriarOperadorRequest request) {
        OperadorDeMissao operador = new OperadorDeMissao();
        operador.setNome(request.getNome());
        operador.setIdade(request.getIdade());
        operador.setAtivo(request.getAtivo());
        operador.setTurno(request.getTurno());
        operador.setAreaEspecializacao(request.getAreaEspecializacao());
        return operador;
    }
}