package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.DadosBiometricos;
import com.MonitoramentoEspacial.interfaceExterna.AtualizaAstronautaRequest;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;
import com.MonitoramentoEspacial.middleware.AstronautaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

// As exceções estão no mesmo pacote, então não precisam de import

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
        validarId(id);
        Astronauta astronauta = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Astronauta não encontrado"));
        return AstronautaMapper.toDTO(astronauta);
    }

    public List<AstronautaDTO> buscarPorNome(String nome) {
        validarNome(nome);
        return repository.findByNomeContainingIgnoreCase(nome).stream()
                .map(AstronautaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<AstronautaDTO> buscarPorNivelAptidao(String nivel) {
        validarNivelAptidao(nivel);
        return repository.findByNivelAptidaoMedica(nivel).stream()
                .map(AstronautaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public AstronautaDTO criarAstronauta(AtualizaAstronautaRequest request) {
        validarRequest(request);
        Astronauta astronauta = AstronautaMapper.fromRequest(request);
        repository.save(astronauta);
        return AstronautaMapper.toDTO(astronauta);
    }

    public AstronautaDTO atualizarAstronauta(Long id, AtualizaAstronautaRequest request) {
        validarId(id);
        validarRequest(request);
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
        validarId(id);
        Astronauta astronauta = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Astronauta não encontrado"));
        repository.delete(astronauta);
    }

    // Métodos de validação
    private void validarId(Long id) {
        if (id == null || id <= 0) {
            throw new ParametroInvalidoException("ID deve ser um número positivo válido");
        }
    }

    private void validarNome(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            throw new ParametroInvalidoException("Nome não pode ser nulo ou vazio");
        }
        if (nome.length() < 2 || nome.length() > 100) {
            throw new ParametroInvalidoException("Nome deve ter entre 2 e 100 caracteres");
        }
    }

    private void validarNivelAptidao(String nivel) {
        if (nivel == null || nivel.trim().isEmpty()) {
            throw new ParametroInvalidoException("Nível de aptidão médica não pode ser nulo ou vazio");
        }
        if (!nivel.matches("^[A-Za-z\\s]+$")) {
            throw new ParametroInvalidoException("Nível de aptidão médica deve conter apenas letras e espaços");
        }
        String[] niveisValidos = {"A", "B", "C", "D", "APTO", "INAPTO", "RESTRITO"};
        boolean nivelValido = false;
        for (String nivelValidoItem : niveisValidos) {
            if (nivel.equalsIgnoreCase(nivelValidoItem)) {
                nivelValido = true;
                break;
            }
        }
        if (!nivelValido) {
            throw new ParametroInvalidoException("Nível de aptidão médica deve ser: A, B, C, D, APTO, INAPTO ou RESTRITO");
        }
    }

    private void validarRequest(AtualizaAstronautaRequest request) {
        if (request == null) {
            throw new ParametroInvalidoException("Request não pode ser nulo");
        }
        
        validarNome(request.getNome());
        validarNivelAptidao(request.getNivelAptidaoMedica());
        
        if (request.getIdade() == null || request.getIdade() < 18 || request.getIdade() > 65) {
            throw new ParametroInvalidoException("Idade deve estar entre 18 e 65 anos");
        }
        
        if (request.getMissoesRealizadas() == null || request.getMissoesRealizadas() < 0) {
            throw new ParametroInvalidoException("Número de missões realizadas deve ser um número não negativo");
        }
        
        if (request.getTipoBiometria() != null && !request.getTipoBiometria().trim().isEmpty()) {
            validarDadosBiometricos(request.getTipoBiometria(), request.getValorBiometria(), request.getUnidadeBiometria());
        }
    }

    private void validarDadosBiometricos(String tipo, String valor, String unidade) {
        if (tipo == null || tipo.trim().isEmpty()) {
            throw new ParametroInvalidoException("Tipo de dados biométricos não pode ser nulo ou vazio");
        }
        
        if (valor == null || valor.trim().isEmpty()) {
            throw new ParametroInvalidoException("Valor dos dados biométricos não pode ser nulo ou vazio");
        }
        
        if (unidade == null || unidade.trim().isEmpty()) {
            throw new ParametroInvalidoException("Unidade dos dados biométricos não pode ser nula ou vazia");
        }
        
        // Validar se o valor é numérico
        try {
            Double.parseDouble(valor);
        } catch (NumberFormatException e) {
            throw new ParametroInvalidoException("Valor dos dados biométricos deve ser numérico");
        }
        
        // Validar tipos de dados biométricos válidos
        String[] tiposValidos = {"PRESSAO_ARTERIAL", "FREQUENCIA_CARDIACA", "TEMPERATURA", "PESO", "ALTURA", "SATURACAO_O2"};
        boolean tipoValido = false;
        for (String tipoValidoItem : tiposValidos) {
            if (tipo.equalsIgnoreCase(tipoValidoItem)) {
                tipoValido = true;
                break;
            }
        }
        if (!tipoValido) {
            throw new ParametroInvalidoException("Tipo de dados biométricos deve ser: PRESSAO_ARTERIAL, FREQUENCIA_CARDIACA, TEMPERATURA, PESO, ALTURA ou SATURACAO_O2");
        }
    }
}
