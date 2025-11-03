package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.interfaceExterna.EspaconaveDTO;
import com.MonitoramentoEspacial.interfaceExterna.SalvarEspaconaveRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Primary
public class EspaconaveServiceLoggingProxy implements EspaconaveServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(EspaconaveServiceLoggingProxy.class);
    private final EspaconaveServiceInterface realEspaconaveService;

    public EspaconaveServiceLoggingProxy(@Qualifier("realEspaconaveService") EspaconaveServiceInterface realEspaconaveService) {
        this.realEspaconaveService = realEspaconaveService;
    }

    @Override
    public EspaconaveDTO criarEspaconave(SalvarEspaconaveRequest request) {
        log.info("PROXY: Requisição para criar espaçonave: {}", request.getNome());
        try {
            EspaconaveDTO dto = realEspaconaveService.criarEspaconave(request);
            log.info("PROXY: Espaçonave '{}' (ID: {}) criada.", dto.getNome(), dto.getId());
            return dto;
        } catch (Exception e) {
            log.error("PROXY: Erro ao criar espaçonave: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public EspaconaveDTO atualizarEspaconave(Long id, SalvarEspaconaveRequest request) {
        log.info("PROXY: Requisição para atualizar espaçonave ID: {}", id);
        try {
            EspaconaveDTO dto = realEspaconaveService.atualizarEspaconave(id, request);
            log.info("PROXY: Espaçonave '{}' (ID: {}) atualizada.", dto.getNome(), dto.getId());
            return dto;
        } catch (Exception e) {
            log.error("PROXY: Erro ao atualizar espaçonave ID {}: {}", id, e.getMessage());
            throw e;
        }
    }

    @Override
    public EspaconaveDTO buscarPorId(Long id) {
        log.info("PROXY: Requisição para buscar espaçonave ID: {}", id);
        try {
            EspaconaveDTO dto = realEspaconaveService.buscarPorId(id);
            log.info("PROXY: Espaçonave encontrada: {}", dto.getNome());
            return dto;
        } catch (Exception e) {
            log.error("PROXY: Erro ao buscar espaçonave ID {}: {}", id, e.getMessage());
            throw e;
        }
    }

    @Override
    public List<EspaconaveDTO> listarEspaconaves(String nome) {
        log.info("PROXY: Requisição para listar espaçonaves (filtro: '{}')", nome);
        List<EspaconaveDTO> lista = realEspaconaveService.listarEspaconaves(nome);
        log.info("PROXY: {} espaçonaves encontradas.", lista.size());
        return lista;
    }

    @Override
    public void deletarEspaconave(Long id) {
        log.info("PROXY: Requisição para deletar espaçonave ID: {}", id);
        try {
            realEspaconaveService.deletarEspaconave(id);
            log.info("PROXY: Espaçonave ID {} deletada.", id);
        } catch (Exception e) {
            log.error("PROXY: Erro ao deletar espaçonave ID {}: {}", id, e.getMessage());
            throw e;
        }
    }
}