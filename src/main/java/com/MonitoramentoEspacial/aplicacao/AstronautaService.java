package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.DadosBiometricos;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;
import com.MonitoramentoEspacial.interfaceExterna.AtualizaAstronautaRequest;
import com.MonitoramentoEspacial.middleware.AstronautaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service("realAstronautaService")
public class AstronautaService implements AstronautaServiceInterface {

    @Autowired
    private AstronautaRepository repository;


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

        // Atualiza os dados principais do astronauta
        astronauta.setNome(request.getNome());
        astronauta.setIdade(request.getIdade());
        astronauta.setAtivo(request.getAtivo());
        astronauta.setNivelAptidaoMedica(request.getNivelAptidaoMedica());
        astronauta.setMissoesRealizadas(request.getMissoesRealizadas());

        // MUDANÇA 3 (CORREÇÃO DE BUG): Lógica para atualizar os dados biométricos
        if (request.getTipoBiometria() != null && !request.getTipoBiometria().isBlank()) {
            DadosBiometricos biometria = astronauta.getDadosBiometricos();
            if (biometria == null) {
                biometria = new DadosBiometricos();
                astronauta.setDadosBiometricos(biometria);
            }
            biometria.setTipo(request.getTipoBiometria());
            biometria.setValor(request.getValorBiometria());
            biometria.setUnidade(request.getUnidadeBiometria());
            biometria.setRegistradoEm(LocalDateTime.now());
        }
        
        Astronauta astronautaSalvo = repository.save(astronauta);
        
        return AstronautaMapper.toDTO(astronautaSalvo);
    }
}