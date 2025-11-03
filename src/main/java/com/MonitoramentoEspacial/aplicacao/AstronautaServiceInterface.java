package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;
import com.MonitoramentoEspacial.interfaceExterna.AtualizaAstronautaRequest;
import com.MonitoramentoEspacial.interfaceExterna.CriarAstronautaRequest; // <- IMPORTAR

import java.util.List;

/**
 * Interface (Contrato) que define as operações de negócio para a entidade Astronauta.
 * ...
 */
public interface AstronautaServiceInterface {

    /**
     * NOVO MÉTODO
     * Cria um novo astronauta no sistema.
     * @param request Dados do astronauta a ser criado.
     * @return O AstronautaDTO do astronauta recém-criado.
     */
    AstronautaDTO criarAstronauta(CriarAstronautaRequest request);

    AstronautaDTO buscarPorId(Long id);

    List<AstronautaDTO> listarAstronautas(String nome);

    AstronautaDTO atualizarAstronauta(Long id, AtualizaAstronautaRequest request);

                     

    
}