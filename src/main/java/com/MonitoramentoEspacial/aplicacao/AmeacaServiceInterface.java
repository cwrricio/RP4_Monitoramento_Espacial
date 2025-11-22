package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.interfaceExterna.AmeacaDTO;
import com.MonitoramentoEspacial.interfaceExterna.RegistrarAmeacaRequest;
import java.util.List;

public interface AmeacaServiceInterface {
    AmeacaDTO registrarAmeaca(RegistrarAmeacaRequest request);
    List<AmeacaDTO> listarPorMissao(Long missaoId);
    List<AmeacaDTO> listarAmeacasCriticas();
}