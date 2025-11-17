package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.interfaceExterna.AmeacaDTO;
import com.MonitoramentoEspacial.interfaceExterna.RegistrarAmeacaRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Primary
public class AmeacaServiceLoggingProxy implements AmeacaServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(AmeacaServiceLoggingProxy.class);
    private final AmeacaServiceInterface realService;

    public AmeacaServiceLoggingProxy(@Qualifier("realAmeacaService") AmeacaServiceInterface realService) {
        this.realService = realService;
    }

    @Override
    public AmeacaDTO registrarAmeaca(RegistrarAmeacaRequest request) {
        log.info("PROXY: Requisição para registrar ameaça do tipo: {}", request.tipo());
        try {
            AmeacaDTO dto = realService.registrarAmeaca(request);
            log.info("PROXY: Ameaça registrada com ID: {}", dto.id());
            return dto;
        } catch (Exception e) {
            log.error("PROXY: Erro ao registrar ameaça: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<AmeacaDTO> listarPorMissao(Long missaoId) {
        log.info("PROXY: Listando ameaças da missão ID: {}", missaoId);
        return realService.listarPorMissao(missaoId);
    }

    @Override
    public List<AmeacaDTO> listarAmeacasCriticas() {
        log.warn("PROXY: Solicitando relatório de ameaças críticas.");
        return realService.listarAmeacasCriticas();
    }
}