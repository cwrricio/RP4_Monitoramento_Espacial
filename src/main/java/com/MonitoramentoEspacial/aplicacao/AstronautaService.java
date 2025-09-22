package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.Astronauta;
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
                .map(a -> new AstronautaDTO(a.getId(), a.getNome(), a.getNivelAptidaoMedica()))
                .collect(Collectors.toList());
    }

    public AstronautaDTO criarAstronauta(AtualizaAstronautaRequest request) {
        Astronauta astronauta = new Astronauta();
        astronauta.setNome(request.getNome());
        astronauta.setNivelAptidaoMedica(request.getNivelAptidaoMedica());
        repository.save(astronauta);
        return new AstronautaDTO(astronauta.getId(), astronauta.getNome(), astronauta.getNivelAptidaoMedica());
    }

    public AstronautaDTO atualizarAstronauta(Long id, AtualizaAstronautaRequest request) {
        Astronauta astronauta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Astronauta não encontrado"));
        astronauta.setNome(request.getNome());
        astronauta.setNivelAptidaoMedica(request.getNivelAptidaoMedica());
        repository.save(astronauta);
        return new AstronautaDTO(astronauta.getId(), astronauta.getNome(), astronauta.getNivelAptidaoMedica());
    }
}
