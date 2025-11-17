package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.DadosBiometricos;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;
import com.MonitoramentoEspacial.interfaceExterna.AtualizaAstronautaRequest;
import com.MonitoramentoEspacial.interfaceExterna.CriarAstronautaRequest;
import com.MonitoramentoEspacial.middleware.AstronautaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementação real da lógica de negócio para Astronautas.
 * É anotado com "realAstronautaService" para ser injetado no Proxy de Logging.
 */
@Service("realAstronautaService")
public class AstronautaService implements AstronautaServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(AstronautaService.class);

    // Dependências final, injetadas via construtor
    private final AstronautaRepository repository;
    private final AstronautaMapper astronautaMapper;

    /**
     * Injeção de Dependência via Construtor.
     * Esta é a melhor prática (vs @Autowired no campo) pois garante que
     * as dependências são 'final' e o objeto é imutável, além de
     * facilitar testes unitários.
     */
    @Autowired
    public AstronautaService(AstronautaRepository repository, AstronautaMapper astronautaMapper) {
        this.repository = repository;
        this.astronautaMapper = astronautaMapper;
    }

    @Override
    @Transactional
    public AstronautaDTO criarAstronauta(CriarAstronautaRequest request) {
        log.info("Iniciando criação do astronauta: {}", request.getNome());
        
        
        Astronauta novoAstronauta = astronautaMapper.toEntity(request);

        Astronauta astronautaSalvo = repository.save(novoAstronauta);
        log.info("Astronauta '{}' criado com sucesso com ID: {}", astronautaSalvo.getNome(), astronautaSalvo.getId());

        
        return astronautaMapper.toDTO(astronautaSalvo);
    }

    @Override
    @Transactional(readOnly = true)
    public AstronautaDTO buscarPorId(Long id) {
        Astronauta astronauta = repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Astronauta não encontrado com ID: " + id));
        
        
        return astronautaMapper.toDTO(astronauta);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AstronautaDTO> listarAstronautas(String nome) {
        List<Astronauta> astronautas;
        if (nome != null && !nome.isBlank()) {
            astronautas = repository.findByNomeContainingIgnoreCase(nome);
        } else {
            astronautas = repository.findAll();
        }

        
        return astronautas.stream()
                .map(astronautaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AstronautaDTO atualizarAstronauta(Long id, AtualizaAstronautaRequest request) {
        Astronauta astronauta = repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Astronauta não encontrado com ID: " + id));

        astronauta.setNome(request.getNome());
        astronauta.setIdade(request.getIdade());
        astronauta.setAtivo(request.getAtivo());
        astronauta.setNivelAptidaoMedica(request.getNivelAptidaoMedica());
        astronauta.setMissoesRealizadas(request.getMissoesRealizadas());

        if (request.getTipoBiometria() != null && !request.getTipoBiometria().isBlank()) {
            
            DadosBiometricos novoDadoBiometrico = new DadosBiometricos();
            novoDadoBiometrico.setTipo(request.getTipoBiometria());
            novoDadoBiometrico.setValor(request.getValorBiometria());
            novoDadoBiometrico.setUnidade(request.getUnidadeBiometria());
            novoDadoBiometrico.setRegistradoEm(LocalDateTime.now());
            
            astronauta.adicionarDadoBiometrico(novoDadoBiometrico);
        }
        
        Astronauta astronautaSalvo = repository.save(astronauta);
        
        return astronautaMapper.toDTO(astronautaSalvo);
    }

    // ===================================================================
    // NOVO MÉTODO ADICIONADO
    // ===================================================================
    /**
     * Implementação da lógica de deleção.
     */
    @Override
    @Transactional
    public void deletarAstronauta(Long id) {
        log.info("Tentando deletar astronauta ID: {}", id);
        
        // Verifica se o recurso existe antes de tentar deletar
        if (!repository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Astronauta não encontrado para exclusão (ID: " + id + ")");
        }
        
        repository.deleteById(id);
        log.info("Astronauta ID: {} deletado com sucesso", id);
    }
}