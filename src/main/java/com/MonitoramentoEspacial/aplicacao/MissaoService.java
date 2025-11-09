package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.Missao;
import com.MonitoramentoEspacial.interfaceExterna.CriarMissaoRequest;
import com.MonitoramentoEspacial.interfaceExterna.MissaoDTO;
import com.MonitoramentoEspacial.middleware.AstronautaRepository;
import com.MonitoramentoEspacial.middleware.MissaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service("realMissaoService") 
public class MissaoService implements MissaoServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(MissaoService.class);

  
    private final MissaoRepository missaoRepository;
    private final AstronautaRepository astronautaRepository;
    private final MissaoMapper missaoMapper; 

    @Autowired
    public MissaoService(MissaoRepository missaoRepository, 
                         AstronautaRepository astronautaRepository, 
                         MissaoMapper missaoMapper) {
        this.missaoRepository = missaoRepository;
        this.astronautaRepository = astronautaRepository;
        this.missaoMapper = missaoMapper;
    }

    @Override
    @Transactional
    public MissaoDTO criarMissao(CriarMissaoRequest request) {
        log.info("Iniciando processo de criação de missão: {}", request.getNome());

        Missao missao = missaoMapper.toEntity(request);

        if (request.getTripulacaoIds() != null && !request.getTripulacaoIds().isEmpty()) {
            List<Astronauta> tripulacao = astronautaRepository.findAllById(request.getTripulacaoIds());
            if (tripulacao.size() != request.getTripulacaoIds().size()) {
                log.warn("Tentativa de criar missão com astronautas inexistentes.");
                throw new RecursoNaoEncontradoException("Um ou mais astronautas não encontrados.");
            }
            missao.associarTripulacao(tripulacao);
        }

        Missao missaoSalva = missaoRepository.save(missao);
        log.info("Missão '{}' criada com sucesso com ID: {}", missaoSalva.getNome(), missaoSalva.getId());

        return missaoMapper.toDTO(missaoSalva);
    }

    @Override
    @Transactional(readOnly = true)
    public MissaoDTO buscarPorId(Long id) {
        Missao missao = missaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Missão não encontrada"));
        
        return missaoMapper.toDTO(missao);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MissaoDTO> listarTodas() {
        return missaoRepository.findAll().stream()
                .map(missaoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletarMissao(Long id) {
        log.info("Tentando deletar missão ID: {}", id);
        if (!missaoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Missão não encontrada para exclusão (ID: " + id + ")");
        }
        missaoRepository.deleteById(id);
        log.info("Missão ID: {} deletada com sucesso", id);
    }

    @Override
    @Transactional
    public MissaoDTO iniciarSimulacao(Long id) {
        log.info("Iniciando simulação para missão ID: {}", id);
        Missao missao = missaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Missão não encontrada (ID: " + id + ")"));
        
        missao.iniciarSimulacao(); 
        
        Missao missaoSalva = missaoRepository.save(missao);
        log.info("Simulação iniciada. Status da missão: {}", missaoSalva.getStatus());
        
        return missaoMapper.toDTO(missaoSalva);
    }
}