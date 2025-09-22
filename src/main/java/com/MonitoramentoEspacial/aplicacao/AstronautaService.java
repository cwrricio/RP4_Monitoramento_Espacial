package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.DadosBiometricos;
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

    public List<AstronautaDTO> buscarPorNome(String nome) {
        return repository.findByNomeContainingIgnoreCase(nome).stream()
                .map(AstronautaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<AstronautaDTO> buscarPorNivelAptidao(String nivel) {
        return repository.findByNivelAptidaoMedica(nivel).stream()
                .map(AstronautaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public AstronautaDTO criarAstronauta(AtualizaAstronautaRequest request) {
        Astronauta astronauta = AstronautaMapper.fromRequest(request);
        repository.save(astronauta);
        return AstronautaMapper.toDTO(astronauta);
    }

    public AstronautaDTO atualizarAstronauta(Long id, AtualizaAstronautaRequest request) {
        Astronauta astronauta = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Astronauta não encontrado"));

        astronauta.setNome(request.getNome());
        astronauta.setNivelAptidaoMedica(request.getNivelAptidaoMedica());
        astronauta.setIdade(request.getIdade());
        astronauta.setAtivo(request.getAtivo());
        astronauta.setMissoesRealizadas(request.getMissoesRealizadas());

        if (request.getTipoBiometria() != null || request.getValorBiometria() != null) {
            DadosBiometricos dados = astronauta.getDadosBiometricos();
            if (dados == null) {
                dados = new DadosBiometricos();
            }
            if (request.getTipoBiometria() != null) {
                dados.setTipo(request.getTipoBiometria());
            }
            if (request.getValorBiometria() != null) {
                dados.setValor(request.getValorBiometria());
            }
            if (request.getUnidadeBiometria() != null) {
                dados.setUnidade(request.getUnidadeBiometria());
            }
            astronauta.setDadosBiometricos(dados);
        }

        repository.save(astronauta);
        return AstronautaMapper.toDTO(astronauta);
    }

    public void deletarAstronauta(Long id) {
        Astronauta astronauta = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Astronauta não encontrado"));
        repository.delete(astronauta);
    }
}
