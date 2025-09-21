package com.example.demo.application;

import com.example.demo.api.dto.*;
import com.example.demo.domain.people.Astronauta;
import com.example.demo.infra.repository.AstronautaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class AstronautaService {
    private final AstronautaRepository repo;
    public AstronautaService(AstronautaRepository repo) { this.repo = repo; }

    @Transactional
    public AstronautaDTO criar(NovoAstronautaRequest req) {
        Astronauta a = new Astronauta();
        a.setNome(req.nome());
        a.setIdade(req.idade());
        a.setAtivo(req.ativo());
        a.setNivelAptidaoMedica(req.nivelAptidaoMedica());
        a.setMissoesRealizadas(req.missoesRealizadas());
        return toDTO(repo.save(a));
    }

    @Transactional(readOnly = true)
    public List<AstronautaDTO> listar() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public AstronautaDTO obter(Long id) {
        Astronauta a = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Astronauta não encontrado"));
        return toDTO(a);
    }

    @Transactional
    public AstronautaDTO atualizar(Long id, AtualizaAstronautaRequest req) {
        Astronauta a = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Astronauta não encontrado"));
        if (req.nome() != null) a.setNome(req.nome());
        if (req.idade() != null) a.setIdade(req.idade());
        if (req.ativo() != null) a.setAtivo(req.ativo());
        if (req.nivelAptidaoMedica() != null) a.setNivelAptidaoMedica(req.nivelAptidaoMedica());
        if (req.missoesRealizadas() != null) a.setMissoesRealizadas(req.missoesRealizadas());
        return toDTO(a);
    }

    @Transactional
    public void remover(Long id) {
        if (!repo.existsById(id)) throw new IllegalArgumentException("Astronauta não encontrado");
        repo.deleteById(id);
    }

    private AstronautaDTO toDTO(Astronauta a){
        return new AstronautaDTO(
                a.getId(), a.getNome(), a.getIdade(), a.getAtivo(),
                a.getNivelAptidaoMedica(), a.getMissoesRealizadas()
        );
    }
}
