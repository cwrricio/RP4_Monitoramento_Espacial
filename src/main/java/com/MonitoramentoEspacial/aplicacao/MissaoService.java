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

    @Autowired
    private MissaoRepository missaoRepository;
    @Autowired
    private AstronautaRepository astronautaRepository;

    @Override
    @Transactional
    public MissaoDTO criarMissao(CriarMissaoRequest request) {
        log.info("Iniciando processo de criação de missão: {}", request.getNome());

        Missao missao = MissaoFactory.fromRequest(request);

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

        return MissaoMapper.toDTO(missaoSalva);
    }

    @Override
    @Transactional(readOnly = true)
    public MissaoDTO buscarPorId(Long id) {
        Missao missao = missaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Missão não encontrada"));
        return MissaoMapper.toDTO(missao);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MissaoDTO> listarTodas() {
        return missaoRepository.findAll().stream()
                .map(MissaoMapper::toDTO)
                .collect(Collectors.toList());
    }
}