package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.Missao;
import com.MonitoramentoEspacial.interfaceExterna.CriarMissaoRequest;
import com.MonitoramentoEspacial.interfaceExterna.MissaoDTO;
import com.MonitoramentoEspacial.middleware.AstronautaRepository;
import com.MonitoramentoEspacial.middleware.MissaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

// Importar Logger (para substituir System.out.println)
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class MissaoService {
    private final MissaoRepository missaoRepository;
    private final AstronautaRepository astronautaRepository;
    private static final Logger log = LoggerFactory.getLogger(MissaoService.class);

    public MissaoService(MissaoRepository missaoRepository, AstronautaRepository astronautaRepository) {
        this.missaoRepository = missaoRepository;
        this.astronautaRepository = astronautaRepository;
    }

    @Transactional
    public MissaoDTO criarMissao(CriarMissaoRequest request) {
        
        Missao missao = MissaoFactory.fromRequest(request);

        // 1. Busca e valida os tripulantes
        List<Long> idsTripulacao = request.getTripulacaoIds();
        List<Astronauta> tripulacao = astronautaRepository.findAllById(idsTripulacao);
        
        // 2. Validação da busca
        if (tripulacao.size() != idsTripulacao.size()) {
            throw new RecursoNaoEncontradoException("Um ou mais astronautas não foram encontrados.");
        }
        
        // 3. Associa a tripulação, delegando a validação de aptidão para o Domínio Missão
        // Isso resolve a integração e o princípio SRP/LSP
        missao.associarTripulacao(tripulacao); 

        Missao missaoSalva = missaoRepository.save(missao);

        log.info("Missão '{}' criada e tripulação integrada com sucesso. ID: {}", missao.getNome(), missaoSalva.getId());
        
        return MissaoMapper.toDTO(missaoSalva);
    }

    @Transactional(readOnly = true)
    public List<MissaoDTO> listarTodas() {
        return missaoRepository.findAll().stream()
            .map(MissaoMapper::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MissaoDTO buscarPorId(Long id) {
        Missao missao = missaoRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Missão não encontrada com o ID: " + id));
        return MissaoMapper.toDTO(missao);
    }

    @Transactional
    public MissaoDTO iniciarSimulacao(Long id) {
        Missao missao = missaoRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Missão não encontrada para iniciar simulação."));
        
        // O Service apenas CHAMA o método de domínio (muito mais limpo)
        missao.iniciarSimulacao(); 

        Missao missaoAtualizada = missaoRepository.save(missao);
        
        // Boas Práticas: Substituição do System.out.println por logging
        log.info("Simulação da missão '{}' iniciada com sucesso.", missao.getNome());
        
        return MissaoMapper.toDTO(missaoAtualizada);
    }
    
    @Transactional
    public void deletarMissao(Long id) {
        if (!missaoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Missão não encontrada com o ID: " + id);
        }
        missaoRepository.deleteById(id);
    }
}
