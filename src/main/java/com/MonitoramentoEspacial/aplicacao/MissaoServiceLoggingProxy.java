package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.interfaceExterna.CriarMissaoRequest;
import com.MonitoramentoEspacial.interfaceExterna.MissaoDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // Marca esta classe como um bean gerenciado pelo Spring
@Primary // Diz ao Spring: "Se alguém pedir por MissaoServiceInterface, entregue esta instância por padrão"
public class MissaoServiceLoggingProxy implements MissaoServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(MissaoServiceLoggingProxy.class);

    // O proxy tem uma referência para o objeto real.
    private final MissaoServiceInterface realMissaoService;

    // Injetamos o bean do serviço real que nomeamos anteriormente
    public MissaoServiceLoggingProxy(@Qualifier("realMissaoService") MissaoServiceInterface realMissaoService) {
        this.realMissaoService = realMissaoService;
    }

    @Override
    public MissaoDTO criarMissao(CriarMissaoRequest request) {
        log.info("PROXY: Entrando no método criarMissao com o nome: {}", request.getNome());
        try {
            MissaoDTO resultado = realMissaoService.criarMissao(request);
            log.info("PROXY: Saindo do método criarMissao. ID da missão criada: {}", resultado.getId());
            return resultado;
        } catch (Exception e) {
            log.error("PROXY: Exceção capturada no método criarMissao: {}", e.getMessage());
            throw e; // Relança a exceção para não alterar o comportamento
        }
    }

    @Override
    public MissaoDTO buscarPorId(Long id) {
        log.info("PROXY: Entrando no método buscarPorId com o ID: {}", id);
        try {
            MissaoDTO resultado = realMissaoService.buscarPorId(id);
            log.info("PROXY: Saindo do método buscarPorId. Missão encontrada: {}", resultado.getNome());
            return resultado;
        } catch (Exception e) {
            log.error("PROXY: Exceção capturada no método buscarPorId: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<MissaoDTO> listarTodas() {
        log.info("PROXY: Entrando no método listarTodas.");
        try {
            List<MissaoDTO> resultado = realMissaoService.listarTodas();
            log.info("PROXY: Saindo do método listarTodas. {} missões encontradas.", resultado.size());
            return resultado;
        } catch (Exception e) {
            log.error("PROXY: Exceção capturada no método listarTodas: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public void deletarMissao(Long id) {
        log.info("PROXY: Entrando no método deletarMissao com o ID: {}", id);
        try {
            realMissaoService.deletarMissao(id);
            log.info("PROXY: Saindo do método deletarMissao.");
        } catch (Exception e) {
            log.error("PROXY: Exceção capturada no método deletarMissao: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public MissaoDTO iniciarSimulacao(Long id) {
        log.info("PROXY: Entrando no método iniciarSimulacao com o ID: {}", id);
        try {
            MissaoDTO resultado = realMissaoService.iniciarSimulacao(id);
            log.info("PROXY: Saindo do método iniciarSimulacao. Missão atualizada: {}", resultado.getNome());
            return resultado;
        } catch (Exception e) {
            log.error("PROXY: Exceção capturada no método iniciarSimulacao: {}", e.getMessage());
            throw e;
        }
    }
}