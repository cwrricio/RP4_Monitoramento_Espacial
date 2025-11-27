package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.*;
import com.MonitoramentoEspacial.interfaceExterna.AmeacaDTO;
import com.MonitoramentoEspacial.interfaceExterna.RegistrarAmeacaRequest;
import com.MonitoramentoEspacial.middleware.AmeacaRepository;
import com.MonitoramentoEspacial.middleware.MissaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("realAmeacaService")
public class AmeacaService implements AmeacaServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(AmeacaService.class);

    private final AmeacaRepository ameacaRepository;
    private final MissaoRepository missaoRepository;
    private final AmeacaMapper ameacaMapper;

    public AmeacaService(AmeacaRepository ameacaRepository, 
                         MissaoRepository missaoRepository, 
                         AmeacaMapper ameacaMapper) {
        this.ameacaRepository = ameacaRepository;
        this.missaoRepository = missaoRepository;
        this.ameacaMapper = ameacaMapper;
    }

    @Override
    @Transactional
    public AmeacaDTO registrarAmeaca(RegistrarAmeacaRequest request) {
        log.info("Processando nova ameaça para a missão ID: {}", request.missaoId());

        @SuppressWarnings("null")
        Missao missao = missaoRepository.findById(request.missaoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Missão não encontrada ID: " + request.missaoId()));

        Ameaca ameaca = ameacaMapper.toEntity(request);
        ameaca.setMissao(missao);
        
        // Lógica de Negócio: Se perigo >= 8, gera um Evento de Alerta na Missão
        if (ameaca.getNivelPerigo() >= 8) {
            log.warn("ALERTA: Ameaça de nível CRÍTICO ({}) detectada!", ameaca.getNivelPerigo());
            Evento eventoAlerta = new Evento();
            eventoAlerta.setTipo(TipoEvento.ALERTA);
            eventoAlerta.setDescricao("AMEAÇA CRÍTICA DETECTADA: " + ameaca.getTipo() + " - " + ameaca.getDescricao());
            missao.adicionarEvento(eventoAlerta);
            missaoRepository.save(missao); // Salva o evento via cascata
        }

        Ameaca salva = ameacaRepository.save(ameaca);
        return ameacaMapper.toDTO(salva);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AmeacaDTO> listarPorMissao(Long missaoId) {
        return ameacaRepository.findByMissaoId(missaoId).stream()
                .map(ameacaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AmeacaDTO> listarAmeacasCriticas() {
        // Consideramos crítico nível >= 8
        return ameacaRepository.findByNivelPerigoGreaterThanEqual(8).stream()
                .map(ameacaMapper::toDTO)
                .collect(Collectors.toList());
    }
}