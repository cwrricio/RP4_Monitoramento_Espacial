package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;
import com.MonitoramentoEspacial.interfaceExterna.AtualizaAstronautaRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementação do Padrão de Projeto Proxy.
 * Esta classe intercepta as chamadas para o serviço de Astronauta, adiciona
 * logging e depois delega a execução para o serviço real.
 */
@Service
@Primary // Define este como o bean principal a ser injetado para a interface AstronautaServiceInterface
public class AstronautaServiceLoggingProxy implements AstronautaServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(AstronautaServiceLoggingProxy.class);
    private final AstronautaServiceInterface realAstronautaService;

    public AstronautaServiceLoggingProxy(@Qualifier("realAstronautaService") AstronautaServiceInterface realAstronautaService) {
        this.realAstronautaService = realAstronautaService;
    }

    @Override
    public AstronautaDTO buscarPorId(Long id) {
        log.info("PROXY: Requisição para buscar astronauta com ID: {}", id);
        try {
            AstronautaDTO resultado = realAstronautaService.buscarPorId(id);
            log.info("PROXY: Astronauta encontrado: {}", resultado.getNome());
            return resultado;
        } catch (Exception e) {
            log.error("PROXY: Erro ao buscar astronauta com ID {}: {}", id, e.getMessage());
            throw e;
        }
    }

    @Override
    public List<AstronautaDTO> listarAstronautas(String nome) {
        log.info("PROXY: Requisição para listar astronautas. Filtro de nome: '{}'", nome);
        List<AstronautaDTO> resultado = realAstronautaService.listarAstronautas(nome);
        log.info("PROXY: {} astronautas encontrados.", resultado.size());
        return resultado;
    }

    @Override
    public AstronautaDTO atualizarAstronauta(Long id, AtualizaAstronautaRequest request) {
        log.info("PROXY: Requisição para atualizar astronauta com ID: {}", id);
        try {
            AstronautaDTO resultado = realAstronautaService.atualizarAstronauta(id, request);
            log.info("PROXY: Astronauta ID {} ('{}') atualizado com sucesso.", resultado.getId(), resultado.getNome());
            return resultado;
        } catch (Exception e) {
            log.error("PROXY: Erro ao atualizar astronauta com ID {}: {}", id, e.getMessage());
            throw e;
        }
    }
}