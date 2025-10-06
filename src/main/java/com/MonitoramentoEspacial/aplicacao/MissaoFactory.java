package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Missao;
import com.MonitoramentoEspacial.aplicacao.dominio.StatusMissao;
import com.MonitoramentoEspacial.interfaceExterna.CriarMissaoRequest;


public class MissaoFactory {

     public static Missao fromRequest(CriarMissaoRequest request) {
        Missao missao = new Missao();
        missao.setNome(request.getNome());
        missao.setObjetivo(request.getObjetivo());
        missao.setDataInicio(request.getDataInicio());
        missao.setStatus(StatusMissao.PLANEJADA); 
        return missao;
    }
    
}
