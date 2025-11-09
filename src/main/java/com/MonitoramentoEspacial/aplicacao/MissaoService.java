package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.Missao;
import com.MonitoramentoEspacial.aplicacao.dominio.ProtocoloEmergencial;
import com.MonitoramentoEspacial.interfaceExterna.AcionarProtocoloRequest;
import com.MonitoramentoEspacial.interfaceExterna.CriarMissaoRequest;
import com.MonitoramentoEspacial.interfaceExterna.EventoDTO;
import com.MonitoramentoEspacial.interfaceExterna.MissaoDTO;
import com.MonitoramentoEspacial.interfaceExterna.ProtocoloEmergencialDTO;
import com.MonitoramentoEspacial.middleware.AstronautaRepository;
import com.MonitoramentoEspacial.middleware.EventoRepository;
import com.MonitoramentoEspacial.middleware.MissaoRepository;
import com.MonitoramentoEspacial.middleware.ProtocoloEmergencialRepository;
import com.MonitoramentoEspacial.aplicacao.dominio.Evento;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("realMissaoService") 
public class MissaoService implements MissaoServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(MissaoService.class);

    // --- Repositórios ---
    private final MissaoRepository missaoRepository;
    private final AstronautaRepository astronautaRepository;
    private final EventoRepository eventoRepository; // NOVO
    private final ProtocoloEmergencialRepository protocoloRepository; // NOVO

    // --- Mappers ---
    private final MissaoMapper missaoMapper;
    private final EventoMapper eventoMapper; // NOVO
    private final ProtocoloEmergencialMapper protocoloMapper; // NOVO

    // Injeção de dependência via construtor
    @Autowired
    public MissaoService(MissaoRepository missaoRepository, 
                         AstronautaRepository astronautaRepository, 
                         EventoRepository eventoRepository, 
                         ProtocoloEmergencialRepository protocoloRepository, 
                         MissaoMapper missaoMapper, 
                         EventoMapper eventoMapper, 
                         ProtocoloEmergencialMapper protocoloMapper) {
        this.missaoRepository = missaoRepository;
        this.astronautaRepository = astronautaRepository;
        this.eventoRepository = eventoRepository;
        this.protocoloRepository = protocoloRepository;
        this.missaoMapper = missaoMapper;
        this.eventoMapper = eventoMapper;
        this.protocoloMapper = protocoloMapper;
    }

    /**
     * Método auxiliar privado para buscar uma missão ou lançar 404
     */
    private Missao getMissaoById(Long missaoId) {
        return missaoRepository.findById(missaoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Missão não encontrada com ID: " + missaoId));
    }

    @Override
    @Transactional
    public MissaoDTO criarMissao(CriarMissaoRequest request) {
        log.info("Iniciando processo de criação de missão: {}", request.getNome());
        Missao missao = missaoMapper.toEntity(request);

        if (request.getTripulacaoIds() != null && !request.getTripulacaoIds().isEmpty()) {
            List<Astronauta> tripulacao = astronautaRepository.findAllById(request.getTripulacaoIds());
            if (tripulacao.size() != request.getTripulacaoIds().size()) {
                log.warn("Tentativa de criar missão com astronautas inexistentes.");
                throw new RecursoNaoEncontradoException("Um ou mais astronautas não encontrados.");
            }
            missao.associarTripulacao(tripulacao);
        }

        Missao missaoSalva = missaoRepository.save(missao);
        log.info("Missão '{}' criada com sucesso com ID: {}", missaoSalva.getNome(), missaoSalva.getId());
        return missaoMapper.toDTO(missaoSalva);
    }

    @Override
    @Transactional(readOnly = true)
    public MissaoDTO buscarPorId(Long id) {
        Missao missao = getMissaoById(id);
        return missaoMapper.toDTO(missao);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MissaoDTO> listarTodas() {
        return missaoRepository.findAll().stream()
                .map(missaoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletarMissao(Long id) {
        log.info("Tentando deletar missão ID: {}", id);
        if (!missaoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Missão não encontrada para exclusão (ID: " + id + ")");
        }
        missaoRepository.deleteById(id);
        log.info("Missão ID: {} deletada com sucesso", id);
    }

    @Override
    @Transactional
    public MissaoDTO iniciarSimulacao(Long id) {
        log.info("Iniciando simulação para missão ID: {}", id);
        Missao missao = getMissaoById(id);
        
        missao.iniciarSimulacao(); 
        
        Missao missaoSalva = missaoRepository.save(missao); 
        log.info("Simulação iniciada. Status da missão: {}", missaoSalva.getStatus());
        return missaoMapper.toDTO(missaoSalva);
    }

    // --- IMPLEMENTAÇÃO DOS NOVOS MÉTODOS ---

    @Override
    @Transactional(readOnly = true)
    public List<EventoDTO> listarEventosPorMissao(Long missaoId) {
        log.debug("Listando eventos para missão ID: {}", missaoId);
        if (!missaoRepository.existsById(missaoId)) {
            throw new RecursoNaoEncontradoException("Missão não encontrada com ID: " + missaoId);
        }
        List<Evento> eventos = eventoRepository.findByMissaoIdOrderByTimestampDesc(missaoId);
        return eventos.stream()
                .map(eventoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProtocoloEmergencialDTO> listarProtocolosPorMissao(Long missaoId) {
        log.debug("Listando protocolos para missão ID: {}", missaoId);
        if (!missaoRepository.existsById(missaoId)) {
            throw new RecursoNaoEncontradoException("Missão não encontrada com ID: " + missaoId);
        }
        List<ProtocoloEmergencial> protocolos = protocoloRepository.findByMissaoIdOrderByAcionadoEmDesc(missaoId);
        return protocolos.stream()
                .map(protocoloMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProtocoloEmergencialDTO acionarProtocolo(Long missaoId, AcionarProtocoloRequest request) {
        log.warn("Acionando protocolo {} para missão ID: {}", request.tipo(), missaoId);
        Missao missao = getMissaoById(missaoId);

        // A entidade Missao cria o Protocolo e o Evento
        ProtocoloEmergencial protocolo = missao.acionarProtocolo(request.tipo(), request.descricao());

        // Salvamos a Missao, e o CascadeType.ALL salvará o novo Protocolo e Evento
        missaoRepository.save(missao);
        
        log.info("Protocolo ID {} acionado para missão ID: {}", protocolo.getId(), missaoId);
        
        // Retornamos o DTO do protocolo que foi criado
        // (O save(missao) atualiza o ID do protocolo por referência)
        return protocoloMapper.toDTO(protocolo);
    }

    @Override
    @Transactional
    public MissaoDTO concluirMissao(Long missaoId) {
        log.info("Concluindo missão ID: {}", missaoId);
        Missao missao = getMissaoById(missaoId);

        // Lógica de domínio é executada na entidade
        missao.concluirMissao();

        // O save(missao) atualiza o status, dataFim e salva o novo Evento
        Missao missaoSalva = missaoRepository.save(missao);
        
        log.info("Missão ID: {} concluída com status {}", missaoId, missaoSalva.getStatus());
        return missaoMapper.toDTO(missaoSalva);
    }
}