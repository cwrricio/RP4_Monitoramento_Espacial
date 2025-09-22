package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.interfaceExterna.AtualizaAstronautaRequest;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;
import com.MonitoramentoEspacial.middleware.AstronautaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AstronautaService {

    private final AstronautaRepository repository;

    public AstronautaService(AstronautaRepository repository) {
        this.repository = repository;
    }

    public List<AstronautaDTO> listarTodos() {
        return repository.findAll().stream()
                .map(AstronautaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public AstronautaDTO buscarPorId(Long id) {
        Astronauta astronauta = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Astronauta não encontrado"));
        return AstronautaMapper.toDTO(astronauta);
    }

    public AstronautaDTO criarAstronauta(AtualizaAstronautaRequest request) {
        Astronauta astronauta = AstronautaMapper.fromRequest(request);
        repository.save(astronauta);
        return AstronautaMapper.toDTO(astronauta);
    }

    public AstronautaDTO atualizarAstronauta(Long id, AtualizaAstronautaRequest request) {
        Astronauta astronauta = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Astronauta não encontrado"));
        astronauta.atualizarDados(request.getNome(), request.getNivelAptidaoMedica());
        repository.save(astronauta);
        return AstronautaMapper.toDTO(astronauta);
    }
}
