package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.interfaceExterna.CriarMissaoRequest;
import com.MonitoramentoEspacial.interfaceExterna.MissaoDTO;

import java.util.List;

public interface MissaoServiceInterface {

    MissaoDTO criarMissao(CriarMissaoRequest request);

    MissaoDTO buscarPorId(Long id);

    List<MissaoDTO> listarTodas();

    void deletarMissao(Long id);
    
    MissaoDTO iniciarSimulacao(Long id);
}