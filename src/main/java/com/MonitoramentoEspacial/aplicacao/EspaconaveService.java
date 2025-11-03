package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Espaconave;
import com.MonitoramentoEspacial.interfaceExterna.EspaconaveDTO;
import com.MonitoramentoEspacial.interfaceExterna.SalvarEspaconaveRequest;
import com.MonitoramentoEspacial.middleware.EspaconaveRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("realEspaconaveService")
public class EspaconaveService implements EspaconaveServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(EspaconaveService.class);

    @Autowired
    private EspaconaveRepository repository;

    @Override
    @Transactional
    public EspaconaveDTO criarEspaconave(SalvarEspaconaveRequest request) {
        log.info("Criando nova espaçonave: {}", request.getNome());
        Espaconave espaconave = EspaconaveMapper.fromRequest(request);
        Espaconave salva = repository.save(espaconave);
        return EspaconaveMapper.toDTO(salva);
    }

    @Override
    @Transactional
    public EspaconaveDTO atualizarEspaconave(Long id, SalvarEspaconaveRequest request) {
        log.info("Atualizando espaçonave ID: {}", id);
        Espaconave espaconave = repository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Espaçonave não encontrada com ID: " + id));

        espaconave.setNome(request.getNome());
        espaconave.setCapacidadeTripulacao(request.getCapacidadeTripulacao());
        espaconave.setStatusOperacional(request.getStatusOperacional());
        
        Espaconave salva = repository.save(espaconave);
        return EspaconaveMapper.toDTO(salva);
    }

    @Override
    @Transactional(readOnly = true)
    public EspaconaveDTO buscarPorId(Long id) {
        Espaconave espaconave = repository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Espaçonave não encontrada com ID: " + id));
        return EspaconaveMapper.toDTO(espaconave);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EspaconaveDTO> listarEspaconaves(String nome) {
        List<Espaconave> lista;
        if (nome != null && !nome.isBlank()) {
            lista = repository.findByNomeContainingIgnoreCase(nome);
        } else {
            lista = repository.findAll();
        }
        return lista.stream()
            .map(EspaconaveMapper::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletarEspaconave(Long id) {
        log.info("Tentando deletar espaçonave ID: {}", id);
        if (!repository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Espaçonave não encontrada para exclusão (ID: " + id + ")");
        }
        repository.deleteById(id);
        log.info("Espaçonave ID: {} deletada com sucesso", id);
    }
}