package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;
import com.MonitoramentoEspacial.interfaceExterna.AtualizaAstronautaRequest;
import com.MonitoramentoEspacial.middleware.AstronautaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AstronautaService {

    @Autowired
    private AstronautaRepository repository;

    @Transactional(readOnly = true)
    public AstronautaDTO buscarPorId(Long id) {
        Astronauta astronauta = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Astronauta não encontrado"));
        return AstronautaMapper.toDTO(astronauta);
    }

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

    @Transactional
    public AstronautaDTO atualizarAstronauta(Long id, AtualizaAstronautaRequest request) {
        Astronauta astronauta = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Astronauta não encontrado"));

        astronauta.setNome(request.getNome());
        
        repository.save(astronauta);
        
        return AstronautaMapper.toDTO(astronauta);
    }
}