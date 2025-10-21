package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;
import com.MonitoramentoEspacial.interfaceExterna.AtualizaAstronautaRequest;

import java.util.List;

/**
 * Interface (Contrato) que define as operações de negócio para a entidade Astronauta.
 * Programar para esta interface permite a inversão de dependência e facilita a
 * implementação de padrões como o Proxy.
 */
public interface AstronautaServiceInterface {

    AstronautaDTO buscarPorId(Long id);

    List<AstronautaDTO> listarAstronautas(String nome);

    AstronautaDTO atualizarAstronauta(Long id, AtualizaAstronautaRequest request);

                     

    
}