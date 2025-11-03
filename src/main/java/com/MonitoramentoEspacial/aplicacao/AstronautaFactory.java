package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.interfaceExterna.CriarAstronautaRequest;

/**
 * Padrão Factory: Centraliza a lógica de criação da entidade Astronauta
 * a partir de um DTO de requisição.
 */
public class AstronautaFactory {

    /**
     * Converte um DTO de requisição em uma entidade de domínio Astronauta.
     * @param request O DTO com os dados de entrada.
     * @return Uma nova instância de Astronauta, pronta para ser persistida.
     */
    public static Astronauta fromRequest(CriarAstronautaRequest request) {
        Astronauta astronauta = new Astronauta();
        astronauta.setNome(request.getNome());
        astronauta.setIdade(request.getIdade());
        astronauta.setAtivo(request.getAtivo());
        astronauta.setNivelAptidaoMedica(request.getNivelAptidaoMedica());
        astronauta.setMissoesRealizadas(request.getMissoesRealizadas());
        // Dados biométricos não são adicionados na criação, apenas na atualização.
        return astronauta;
    }
}