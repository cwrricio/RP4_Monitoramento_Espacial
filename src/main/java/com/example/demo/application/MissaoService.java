package com.example.demo.application;

import com.example.demo.api.dto.*;
import com.example.demo.domain.mission.Missao;
import com.example.demo.domain.people.Astronauta;
import com.example.demo.infra.repository.AstronautaRepository;
import com.example.demo.infra.repository.MissaoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MissaoService {

    private final MissaoRepository missaoRepo;
    private final AstronautaRepository astronautaRepo;

    public MissaoService(MissaoRepository missaoRepo, AstronautaRepository astronautaRepo) {
        this.missaoRepo = missaoRepo;
        this.astronautaRepo = astronautaRepo;
    }

    @Transactional
    public MissaoDTO criarMissao(CriarMissaoRequest req) {
        Missao m = new Missao();
        m.setNome(req.nome());
        m.setTipo(req.tipo());
        m.setStatus("PLANEJAMENTO");
        return toDTO(missaoRepo.save(m));
    }

    public List<MissaoDTO> listarMissoes() {
        return missaoRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MissaoDTO obterMissao(Long id) {
        Missao m = missaoRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Missão não encontrada com ID: " + id));
        return toDTO(m);
    }

    @Transactional
    public MissaoDTO atualizarMissao(Long id, AtualizarMissaoRequest req) {
        Missao m = missaoRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Missão não encontrada com ID: " + id));
        if (req.nome() != null) m.setNome(req.nome());
        if (req.tipo() != null) m.setTipo(req.tipo());
        if (req.status() != null) m.setStatus(req.status());
        return toDTO(m);
    }

    @Transactional
    public void deletarMissao(Long id) {
        missaoRepo.deleteById(id);
    }

    @Transactional
    public void adicionarAstronauta(Long missaoId, Long astronautaId) {
        Missao m = missaoRepo.findById(missaoId).orElseThrow(() -> new EntityNotFoundException("Missão não encontrada com ID: " + missaoId));
        Astronauta a = astronautaRepo.findById(astronautaId).orElseThrow(() -> new EntityNotFoundException("Astronauta não encontrado com ID: " + astronautaId));
        m.adicionarTripulante(a);
    }

    @Transactional
    public void removerAstronauta(Long missaoId, Long astronautaId) {
        Missao m = missaoRepo.findById(missaoId).orElseThrow(() -> new EntityNotFoundException("Missão não encontrada com ID: " + missaoId));
        Astronauta a = astronautaRepo.findById(astronautaId).orElseThrow(() -> new EntityNotFoundException("Astronauta não encontrado com ID: " + astronautaId));
        m.removerTripulante(a);
    }

    public SimulacaoResultadoDTO executarSimulacao(Long missaoId, ExecutarSimulacaoRequest req) {
        return new SimulacaoResultadoDTO(missaoId, "Simulação executada com sucesso", "SUCESSO");
    }

    private MissaoDTO toDTO(Missao m) {
        String tipo = m.getTipo() != null ? m.getTipo().name() : null;
        String status = m.getStatus() != null ? m.getStatus().name() : null;
        String prioridade = m.getPrioridade() != null ? m.getPrioridade().name() : null;
        return new MissaoDTO(m.getId(), m.getCodigo(), m.getNome(), m.getDescricao(), tipo, status, prioridade, m.getDataInicioPlanejada(), m.getDataFimPlanejada(), m.getDataInicioReal(), m.getDataFimReal());
    }
}