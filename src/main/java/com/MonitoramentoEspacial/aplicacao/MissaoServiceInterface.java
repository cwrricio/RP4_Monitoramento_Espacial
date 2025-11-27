package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.interfaceExterna.*;
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
    
    // NOVO
    MissaoDTO atualizarMissao(Long id, AtualizarMissaoRequest request);
}