package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.*;
import com.MonitoramentoEspacial.interfaceExterna.*;
import com.MonitoramentoEspacial.middleware.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("realMissaoService") 
public class MissaoService implements MissaoServiceInterface {

    // --- REPOSITÓRIOS ---
    private final MissaoRepository missaoRepository;
    private final AstronautaRepository astronautaRepository;
    private final EspaconaveRepository espaconaveRepository;
    private final EventoRepository eventoRepository;
    private final ProtocoloEmergencialRepository protocoloRepository;

    // --- MAPPERS ---
    private final MissaoMapper missaoMapper;
    private final EventoMapper eventoMapper;
    private final ProtocoloEmergencialMapper protocoloMapper;

    // --- CONSTRUTOR ---
    public MissaoService(MissaoRepository missaoRepository, 
                         AstronautaRepository astronautaRepository, 
                         EspaconaveRepository espaconaveRepository,
                         EventoRepository eventoRepository, 
                         ProtocoloEmergencialRepository protocoloRepository, 
                         MissaoMapper missaoMapper, 
                         EventoMapper eventoMapper, 
                         ProtocoloEmergencialMapper protocoloMapper) {
        this.missaoRepository = missaoRepository;
        this.astronautaRepository = astronautaRepository;
        this.espaconaveRepository = espaconaveRepository;
        this.eventoRepository = eventoRepository;
        this.protocoloRepository = protocoloRepository;
        this.missaoMapper = missaoMapper;
        this.eventoMapper = eventoMapper;
        this.protocoloMapper = protocoloMapper;
    }

    @SuppressWarnings("null")
    private Missao getMissaoById(Long missaoId) {
        return missaoRepository.findById(missaoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Missão não encontrada com ID: " + missaoId));
    }

    // ==================================================================================
    // CRIAÇÃO E ATUALIZAÇÃO
    // ==================================================================================

    @Override
    @Transactional
    public MissaoDTO criarMissao(CriarMissaoRequest request) {
        Missao missao = missaoMapper.toEntity(request);
        missao.setStatus(StatusMissao.PLANEJADA);

        // Associação da Tripulação
        if (request.getTripulacaoIds() != null && !request.getTripulacaoIds().isEmpty()) {
            @SuppressWarnings("null")
            List<Astronauta> tripulacao = astronautaRepository.findAllById(request.getTripulacaoIds());
            
            if (tripulacao.size() != request.getTripulacaoIds().size()) {
                throw new RecursoNaoEncontradoException("Um ou mais IDs de astronautas não foram encontrados no banco.");
            }
            missao.associarTripulacao(tripulacao);
        }

        // Associação da Espaçonave
        if (request.getEspaconaveId() != null) {
            @SuppressWarnings("null")
            Espaconave espaconave = espaconaveRepository.findById(request.getEspaconaveId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Espaçonave não encontrada com ID: " + request.getEspaconaveId()));
            
            if ("DESATIVADA".equalsIgnoreCase(espaconave.getStatusOperacional()) || 
                "EM_MANUTENCAO".equalsIgnoreCase(espaconave.getStatusOperacional())) {
                 throw new IllegalStateException("A espaçonave selecionada (" + espaconave.getNome() + ") não está operacional.");
            }
            missao.setEspaconave(espaconave);
        }

        Missao missaoSalva = missaoRepository.save(missao);
        return missaoMapper.toDTO(missaoSalva);
    }

    @Override
    @Transactional
    public MissaoDTO atualizarMissao(Long id, AtualizarMissaoRequest request) {
        Missao missao = getMissaoById(id);

        if (request.getNome() != null && !request.getNome().isBlank()) {
            missao.setNome(request.getNome());
        }
        if (request.getObjetivo() != null) {
            missao.setObjetivo(request.getObjetivo());
        }
        if (request.getDataInicio() != null) {
            missao.setDataInicio(request.getDataInicio());
        }
        if (request.getDataFim() != null) {
            missao.setDataFim(request.getDataFim());
        }

        if (request.getTripulacaoIds() != null) {
            @SuppressWarnings("null")
            List<Astronauta> novaTripulacao = astronautaRepository.findAllById(request.getTripulacaoIds());
            if (novaTripulacao.size() != request.getTripulacaoIds().size()) {
                throw new RecursoNaoEncontradoException("Um ou mais astronautas da nova lista não foram encontrados.");
            }
            missao.associarTripulacao(novaTripulacao);
        }

        if (request.getEspaconaveId() != null) {
            @SuppressWarnings("null")
            Espaconave novaEspaconave = espaconaveRepository.findById(request.getEspaconaveId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Espaçonave não encontrada com ID: " + request.getEspaconaveId()));
            
            if ("DESATIVADA".equalsIgnoreCase(novaEspaconave.getStatusOperacional())) {
                throw new IllegalStateException("A nova espaçonave selecionada não está operacional.");
            }
            missao.setEspaconave(novaEspaconave);
        }

        @SuppressWarnings("null")
        Missao missaoSalva = missaoRepository.save(missao);
        return missaoMapper.toDTO(missaoSalva);
    }

    // ==================================================================================
    // LEITURA E REMOÇÃO
    // ==================================================================================

    @Override
    @Transactional(readOnly = true)
    public MissaoDTO buscarPorId(Long id) {
        return missaoMapper.toDTO(getMissaoById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MissaoDTO> listarTodas() {
        return missaoRepository.findAll().stream()
                .map(missaoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    @Override
    @Transactional
    public void deletarMissao(Long id) {
        if (!missaoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Missão não encontrada para exclusão (ID: " + id + ")");
        }
        missaoRepository.deleteById(id);
    }

    // ==================================================================================
    // AÇÕES ESPECÍFICAS
    // ==================================================================================

    @Override
    @Transactional
    public MissaoDTO iniciarSimulacao(Long id) {
        Missao missao = getMissaoById(id);
        missao.iniciarSimulacao();
        return missaoMapper.toDTO(missaoRepository.save(missao));
    }

    @SuppressWarnings("null")
    @Override
    @Transactional(readOnly = true)
    public List<EventoDTO> listarEventosPorMissao(Long missaoId) {
        if (!missaoRepository.existsById(missaoId)) {
            throw new RecursoNaoEncontradoException("Missão não encontrada com ID: " + missaoId);
        }
        return eventoRepository.findTop100ByMissaoIdOrderByTimestampDesc(missaoId).stream()
                .map(eventoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    @Override
    @Transactional(readOnly = true)
    public List<ProtocoloEmergencialDTO> listarProtocolosPorMissao(Long missaoId) {
        if (!missaoRepository.existsById(missaoId)) {
            throw new RecursoNaoEncontradoException("Missão não encontrada com ID: " + missaoId);
        }
        return protocoloRepository.findByMissaoIdOrderByAcionadoEmDesc(missaoId).stream()
                .map(protocoloMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProtocoloEmergencialDTO acionarProtocolo(Long missaoId, AcionarProtocoloRequest request) {
        Missao missao = getMissaoById(missaoId);
        ProtocoloEmergencial protocolo = missao.acionarProtocolo(request.tipo(), request.descricao());
        missaoRepository.save(missao);
        return protocoloMapper.toDTO(protocolo);
    }

    @Override
    @Transactional
    public MissaoDTO concluirMissao(Long missaoId) {
        Missao missao = getMissaoById(missaoId);
        missao.concluirMissao();
        return missaoMapper.toDTO(missaoRepository.save(missao));
    }
}