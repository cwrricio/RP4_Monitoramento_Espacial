package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.interfaceExterna.AcionarProtocoloRequest;
import com.MonitoramentoEspacial.interfaceExterna.CriarMissaoRequest;
import com.MonitoramentoEspacial.interfaceExterna.EventoDTO;
import com.MonitoramentoEspacial.interfaceExterna.MissaoDTO;
import com.MonitoramentoEspacial.interfaceExterna.ProtocoloEmergencialDTO;

import java.util.List;

public interface MissaoServiceInterface {

    MissaoDTO criarMissao(CriarMissaoRequest request);

    MissaoDTO buscarPorId(Long id);

    List<MissaoDTO> listarTodas();

    void deletarMissao(Long id);
    
    MissaoDTO iniciarSimulacao(Long id);

    List<EventoDTO> listarEventosPorMissao(Long missaoId);

    List<ProtocoloEmergencialDTO> listarProtocolosPorMissao(Long missaoId);

    ProtocoloEmergencialDTO acionarProtocolo(Long missaoId, AcionarProtocoloRequest request);

    MissaoDTO concluirMissao(Long missaoId);
}