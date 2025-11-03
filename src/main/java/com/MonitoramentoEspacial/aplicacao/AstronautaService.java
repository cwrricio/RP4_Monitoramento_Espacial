package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.DadosBiometricos;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;
import com.MonitoramentoEspacial.interfaceExterna.AtualizaAstronautaRequest;
import com.MonitoramentoEspacial.interfaceExterna.CriarAstronautaRequest; // <- IMPORTAR
import com.MonitoramentoEspacial.middleware.AstronautaRepository;
import org.slf4j.Logger; // <- IMPORTAR
import org.slf4j.LoggerFactory; // <- IMPORTAR
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service("realAstronautaService")
public class AstronautaService implements AstronautaServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(AstronautaService.class); // <- ADICIONAR LOGGER

    @Autowired
    private AstronautaRepository repository;


    @Override
    @Transactional
    public AstronautaDTO criarAstronauta(CriarAstronautaRequest request) {
        log.info("Iniciando criação do astronauta: {}", request.getNome());
        
        Astronauta novoAstronauta = AstronautaFactory.fromRequest(request);

        Astronauta astronautaSalvo = repository.save(novoAstronauta);
        log.info("Astronauta '{}' criado com sucesso com ID: {}", astronautaSalvo.getNome(), astronautaSalvo.getId());

        return AstronautaMapper.toDTO(astronautaSalvo);
    }

    @Override
    @Transactional(readOnly = true)
    public AstronautaDTO buscarPorId(Long id) {
        Astronauta astronauta = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Astronauta não encontrado com ID: " + id));
        return AstronautaMapper.toDTO(astronauta);
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
        return astronautas.stream().map(AstronautaMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AstronautaDTO atualizarAstronauta(Long id, AtualizaAstronautaRequest request) {
        Astronauta astronauta = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Astronauta não encontrado com ID: " + id));

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
        
        return AstronautaMapper.toDTO(astronautaSalvo);
    }
}