package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.OperadorDeMissao;
import com.MonitoramentoEspacial.interfaceExterna.CriarOperadorRequest;
import com.MonitoramentoEspacial.interfaceExterna.OperadorDeMissaoDTO;
import com.MonitoramentoEspacial.middleware.OperadorDeMissaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("realOperadorService")
public class OperadorDeMissaoService implements OperadorDeMissaoServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(OperadorDeMissaoService.class);

    @Autowired
    private OperadorDeMissaoRepository repository;

    @Override
    @Transactional
    public OperadorDeMissaoDTO criarOperador(CriarOperadorRequest request) {
        log.info("Criando novo operador: {}", request.getNome());
        OperadorDeMissao operador = OperadorDeMissaoFactory.fromRequest(request);
        OperadorDeMissao salvo = repository.save(operador);
        return OperadorDeMissaoMapper.toDTO(salvo);
    }

    @Override
    @Transactional(readOnly = true)
    public OperadorDeMissaoDTO buscarPorId(Long id) {
        OperadorDeMissao operador = repository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Operador não encontrado com ID: " + id));
        return OperadorDeMissaoMapper.toDTO(operador);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OperadorDeMissaoDTO> listarOperadores(String nome) {
        List<OperadorDeMissao> operadores;
        if (nome != null && !nome.isBlank()) {
            operadores = repository.findByNomeContainingIgnoreCase(nome);
        } else {
            operadores = repository.findAll();
        }
        return operadores.stream()
            .map(OperadorDeMissaoMapper::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletarOperador(Long id) {
        log.info("Tentando deletar operador ID: {}", id);
        if (!repository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Operador não encontrado para exclusão (ID: " + id + ")");
        }
        repository.deleteById(id);
        log.info("Operador ID: {} deletado com sucesso", id);
    }
}