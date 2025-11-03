package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.interfaceExterna.CriarOperadorRequest;
import com.MonitoramentoEspacial.interfaceExterna.OperadorDeMissaoDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Primary
public class OperadorDeMissaoServiceLoggingProxy implements OperadorDeMissaoServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(OperadorDeMissaoServiceLoggingProxy.class);
    private final OperadorDeMissaoServiceInterface realOperadorService;

    public OperadorDeMissaoServiceLoggingProxy(@Qualifier("realOperadorService") OperadorDeMissaoServiceInterface realOperadorService) {
        this.realOperadorService = realOperadorService;
    }

    @Override
    public OperadorDeMissaoDTO criarOperador(CriarOperadorRequest request) {
        log.info("PROXY: Requisição para criar operador: {}", request.getNome());
        try {
            OperadorDeMissaoDTO dto = realOperadorService.criarOperador(request);
            log.info("PROXY: Operador '{}' (ID: {}) criado.", dto.getNome(), dto.getId());
            return dto;
        } catch (Exception e) {
            log.error("PROXY: Erro ao criar operador: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public OperadorDeMissaoDTO buscarPorId(Long id) {
        log.info("PROXY: Requisição para buscar operador ID: {}", id);
        try {
            OperadorDeMissaoDTO dto = realOperadorService.buscarPorId(id);
            log.info("PROXY: Operador encontrado: {}", dto.getNome());
            return dto;
        } catch (Exception e) {
            log.error("PROXY: Erro ao buscar operador ID {}: {}", id, e.getMessage());
            throw e;
        }
    }

    @Override
    public List<OperadorDeMissaoDTO> listarOperadores(String nome) {
        log.info("PROXY: Requisição para listar operadores (filtro: '{}')", nome);
        List<OperadorDeMissaoDTO> lista = realOperadorService.listarOperadores(nome);
        log.info("PROXY: {} operadores encontrados.", lista.size());
        return lista;
    }

    @Override
    public void deletarOperador(Long id) {
        log.info("PROXY: Requisição para deletar operador ID: {}", id);
        try {
            realOperadorService.deletarOperador(id);
            log.info("PROXY: Operador ID {} deletado.", id);
        } catch (Exception e) {
            log.error("PROXY: Erro ao deletar operador ID {}: {}", id, e.getMessage());
            throw e;
        }
    }
}