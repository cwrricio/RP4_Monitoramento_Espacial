package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.interfaceExterna.AcionarProtocoloRequest;
import com.MonitoramentoEspacial.interfaceExterna.AtualizarMissaoRequest;
import com.MonitoramentoEspacial.interfaceExterna.CriarMissaoRequest;
import com.MonitoramentoEspacial.interfaceExterna.EventoDTO;
import com.MonitoramentoEspacial.interfaceExterna.MissaoDTO;
import com.MonitoramentoEspacial.interfaceExterna.ProtocoloEmergencialDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Primary
public class MissaoServiceLoggingProxy implements MissaoServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(MissaoServiceLoggingProxy.class);

    private final MissaoServiceInterface realMissaoService;

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
            throw e;
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

    //MÉTODOS NOVOS ADICIONADOS 

    @Override
    public List<EventoDTO> listarEventosPorMissao(Long missaoId) {
        log.info("PROXY: Entrando no método listarEventosPorMissao para a missão ID: {}", missaoId);
        try {
            List<EventoDTO> resultado = realMissaoService.listarEventosPorMissao(missaoId);
            log.info("PROXY: Saindo do método listarEventosPorMissao. {} eventos encontrados.", resultado.size());
            return resultado;
        } catch (Exception e) {
            log.error("PROXY: Exceção capturada no método listarEventosPorMissao: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<ProtocoloEmergencialDTO> listarProtocolosPorMissao(Long missaoId) {
        log.info("PROXY: Entrando no método listarProtocolosPorMissao para a missão ID: {}", missaoId);
        try {
            List<ProtocoloEmergencialDTO> resultado = realMissaoService.listarProtocolosPorMissao(missaoId);
            log.info("PROXY: Saindo do método listarProtocolosPorMissao. {} protocolos encontrados.", resultado.size());
            return resultado;
        } catch (Exception e) {
            log.error("PROXY: Exceção capturada no método listarProtocolosPorMissao: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public ProtocoloEmergencialDTO acionarProtocolo(Long missaoId, AcionarProtocoloRequest request) {
        log.warn("PROXY: Entrando no método acionarProtocolo {} para a missão ID: {}", request.tipo(), missaoId);
        try {
            ProtocoloEmergencialDTO resultado = realMissaoService.acionarProtocolo(missaoId, request);
            log.warn("PROXY: Saindo do método acionarProtocolo. Protocolo ID {} acionado.", resultado.id());
            return resultado;
        } catch (Exception e) {
            log.error("PROXY: Exceção capturada no método acionarProtocolo: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public MissaoDTO concluirMissao(Long missaoId) {
        log.info("PROXY: Entrando no método concluirMissao para a missão ID: {}", missaoId);
        try {
            MissaoDTO resultado = realMissaoService.concluirMissao(missaoId);
            log.info("PROXY: Saindo do método concluirMissao. Missão concluída: {}", resultado.getNome());
            return resultado;
        } catch (Exception e) {
            log.error("PROXY: Exceção capturada no método concluirMissao: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public MissaoDTO atualizarMissao(Long id, AtualizarMissaoRequest request) {
        log.info("PROXY: Requisição para atualizar missão ID: {}", id);
        try {
            MissaoDTO dto = realMissaoService.atualizarMissao(id, request);
            log.info("PROXY: Missão ID {} atualizada com sucesso.", dto.getId());
            return dto;
        } catch (Exception e) {
            log.error("PROXY: Erro ao atualizar missão ID {}: {}", id, e.getMessage());
            throw e;
        }
    }
}