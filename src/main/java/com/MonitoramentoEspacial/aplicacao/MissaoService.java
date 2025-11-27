package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.Missao;
import com.MonitoramentoEspacial.aplicacao.dominio.ProtocoloEmergencial;
import com.MonitoramentoEspacial.aplicacao.dominio.StatusMissao;
import com.MonitoramentoEspacial.aplicacao.dominio.Evento; // Importe Evento!
import com.MonitoramentoEspacial.interfaceExterna.*;
import com.MonitoramentoEspacial.middleware.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("realMissaoService") 
public class MissaoService implements MissaoServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(MissaoService.class);

    private final MissaoRepository missaoRepository;
    private final AstronautaRepository astronautaRepository;
    private final EventoRepository eventoRepository;
    private final ProtocoloEmergencialRepository protocoloRepository;
    private final MissaoMapper missaoMapper;
    private final EventoMapper eventoMapper;
    private final ProtocoloEmergencialMapper protocoloMapper;

    public MissaoService(MissaoRepository missaoRepository, AstronautaRepository astronautaRepository, EventoRepository eventoRepository, ProtocoloEmergencialRepository protocoloRepository, MissaoMapper missaoMapper, EventoMapper eventoMapper, ProtocoloEmergencialMapper protocoloMapper) {
        this.missaoRepository = missaoRepository;
        this.astronautaRepository = astronautaRepository;
        this.eventoRepository = eventoRepository;
        this.protocoloRepository = protocoloRepository;
        this.missaoMapper = missaoMapper;
        this.eventoMapper = eventoMapper;
        this.protocoloMapper = protocoloMapper;
    }

    private Missao getMissaoById(Long missaoId) {
        return missaoRepository.findById(missaoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Missão não encontrada com ID: " + missaoId));
    }

    @Override
    @Transactional
    public MissaoDTO criarMissao(CriarMissaoRequest request) {
        Missao missao = missaoMapper.toEntity(request);
        missao.setStatus(StatusMissao.PLANEJADA);
        if (request.getTripulacaoIds() != null && !request.getTripulacaoIds().isEmpty()) {
            List<Astronauta> tripulacao = astronautaRepository.findAllById(request.getTripulacaoIds());
            if (tripulacao.size() != request.getTripulacaoIds().size()) {
                throw new RecursoNaoEncontradoException("Um ou mais astronautas não encontrados.");
            }
            missao.associarTripulacao(tripulacao);
        }
        Missao missaoSalva = missaoRepository.save(missao);
        return missaoMapper.toDTO(missaoSalva);
    }

    // --- NOVO MÉTODO PARA CORRIGIR ERRO DE ATUALIZAÇÃO ---
    @Override
    @Transactional
    public MissaoDTO atualizarMissao(Long id, AtualizarMissaoRequest request) {
        Missao missao = getMissaoById(id);
        
        if (request.getNome() != null) missao.setNome(request.getNome());
        if (request.getObjetivo() != null) missao.setObjetivo(request.getObjetivo());
        if (request.getDataInicio() != null) missao.setDataInicio(request.getDataInicio());
        if (request.getDataFim() != null) missao.setDataFim(request.getDataFim());

        if (request.getTripulacaoIds() != null) {
            List<Astronauta> novaTripulacao = astronautaRepository.findAllById(request.getTripulacaoIds());
            missao.associarTripulacao(novaTripulacao);
        }

        Missao salva = missaoRepository.save(missao);
        return missaoMapper.toDTO(salva);
    }

    @Override
    @Transactional(readOnly = true)
    public MissaoDTO buscarPorId(Long id) {
        return missaoMapper.toDTO(getMissaoById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MissaoDTO> listarTodas() {
        return missaoRepository.findAll().stream().map(missaoMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletarMissao(Long id) {
        if (!missaoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Missão não encontrada para exclusão (ID: " + id + ")");
        }
        missaoRepository.deleteById(id);
    }

    @Override
    @Transactional
    public MissaoDTO iniciarSimulacao(Long id) {
        Missao missao = getMissaoById(id);
        missao.iniciarSimulacao();
        return missaoMapper.toDTO(missaoRepository.save(missao));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventoDTO> listarEventosPorMissao(Long missaoId) {
        if (!missaoRepository.existsById(missaoId)) throw new RecursoNaoEncontradoException("Missão não encontrada: " + missaoId);
        return eventoRepository.findByMissaoIdOrderByTimestampDesc(missaoId).stream().map(eventoMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProtocoloEmergencialDTO> listarProtocolosPorMissao(Long missaoId) {
        if (!missaoRepository.existsById(missaoId)) throw new RecursoNaoEncontradoException("Missão não encontrada: " + missaoId);
        return protocoloRepository.findByMissaoIdOrderByAcionadoEmDesc(missaoId).stream().map(protocoloMapper::toDTO).collect(Collectors.toList());
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