package com.MonitoramentoEspacial.aplicacao.dominio;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "missao")
public class Missao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(length = 500)
    private String objetivo;

    private LocalDate dataInicio;
    private LocalDate dataFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusMissao status;

    @Column(length = 50)
    private String tipoSimulacao;

    // --- RELACIONAMENTOS (EXISTENTES E NOVOS) ---

    @ManyToMany
    @JoinTable(
        name = "missao_astronauta",
        joinColumns = @JoinColumn(name = "missao_id"),
        inverseJoinColumns = @JoinColumn(name = "astronauta_id")
    )
    private List<Astronauta> tripulacao = new ArrayList<>();
    
    /**
     * NOVO: Relacionamento com OperadorDeMissao.
     * Muitas missões podem ser gerenciadas por um operador.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_id")
    private OperadorDeMissao operadorResponsavel;

    /**
     * NOVO: Relacionamento com Espaconave.
     * Muitas missões podem usar a mesma espaçonave.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "espaconave_id")
    private Espaconave espaconave;

    /**
     * NOVO: Relacionamento com Simulacao.
     * Uma missão pode ter várias simulações.
     * CascadeType.ALL: Se a missão for deletada, suas simulações também são.
     * orphanRemoval = true: Se uma simulação for removida desta lista, ela é deletada do banco.
     */
    @OneToMany(
        mappedBy = "missao",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<Simulacao> simulacoes = new ArrayList<>();
    
    /**
     * NOVO: Relacionamento com ProtocoloEmergencial.
     */
    @OneToMany(
        mappedBy = "missao",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<ProtocoloEmergencial> protocolos = new ArrayList<>();

    /**
     * NOVO: Relacionamento com Evento.
     */
    @OneToMany(
        mappedBy = "missao",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<Evento> eventos = new ArrayList<>();

    // Construtor vazio para JPA
    public Missao() {}


    // ----------------------------------------------------
    // METODOS DE DOMÍNIO (Comportamento)
    // ----------------------------------------------------

    /**
     * Inicia a simulação, alterando o status e registrando a data.
     * @throws IllegalStateException se a missão não estiver PLANEJADA.
     */
    public void iniciarSimulacao() {
        if (this.status != StatusMissao.PLANEJADA) {
            throw new IllegalStateException("A simulação só pode ser iniciada se a missão estiver PLANEJADA.");
        }
        this.status = StatusMissao.EM_ANDAMENTO;
        this.dataInicio = LocalDate.now();
    }


    /**
    * Método de Domínio para associar e validar a tripulação.
    * Delega a validação de aptidão para a própria entidade Astronauta (Coesão).
    * @param novosTripulantes a lista de astronautas a serem escalados.
    * @throws IllegalArgumentException se houver astronautas inaptos.
    */
    public void associarTripulacao(List<Astronauta> novosTripulantes) {
        if (novosTripulantes == null || novosTripulantes.isEmpty()) {
            throw new IllegalArgumentException("A tripulação de uma missão não pode ser vazia.");
        }
        
        List<Astronauta> astronautasInaptos = novosTripulantes.stream()
            .filter(a -> !a.podeSerTripulante())
            .collect(Collectors.toList());

        if (!astronautasInaptos.isEmpty()) {
            String nomes = astronautasInaptos.stream().map(Astronauta::getNome).collect(Collectors.joining(", "));
            throw new IllegalArgumentException("Os seguintes astronautas estão inaptos para a missão: " + nomes + 
                                               ". Verifique o status 'ativo' e o 'nível de aptidão médica'.");
        }

        this.tripulacao.clear();
        this.tripulacao.addAll(novosTripulantes);
    }
    
    public void adicionarEvento(Evento evento) {
        this.eventos.add(evento);
        evento.setMissao(this);
    }

    public void concluirMissao() {
        if (this.status != StatusMissao.EM_ANDAMENTO) {
            throw new IllegalStateException("A missão só pode ser concluída se estiver EM_ANDAMENTO.");
        }
        this.status = StatusMissao.CONCLUIDA;
        this.dataFim = LocalDate.now();
        
        Evento evento = new Evento();
        evento.setTipo(TipoEvento.INFO);
        evento.setDescricao("Missão concluída com sucesso.");
        this.adicionarEvento(evento);
    }

    public ProtocoloEmergencial acionarProtocolo(TipoProtocolo tipo, String descricao) {
        if (this.status != StatusMissao.EM_ANDAMENTO) {
            throw new IllegalStateException("Protocolos só podem ser acionados em missões EM_ANDAMENTO.");
        }
        
        ProtocoloEmergencial protocolo = new ProtocoloEmergencial();
        protocolo.setTipo(tipo);
        protocolo.setDescricao(descricao);
        protocolo.setAcionadoEm(java.time.LocalDateTime.now());
        this.adicionarProtocolo(protocolo); 

        Evento evento = new Evento();
        evento.setTipo(TipoEvento.ALERTA); 
        evento.setDescricao("Protocolo de emergência acionado: " + tipo + ". Motivo: " + descricao);
        this.adicionarEvento(evento);

        return protocolo;
    }
    
    /**
     * NOVO: Método auxiliar para adicionar uma simulação à missão.
     */
    public void adicionarSimulacao(Simulacao simulacao) {
        this.simulacoes.add(simulacao);
        simulacao.setMissao(this);
    }

    /**
     * NOVO: Método auxiliar para adicionar um protocolo à missão.
     */
    public void adicionarProtocolo(ProtocoloEmergencial protocolo) {
        this.protocolos.add(protocolo);
        protocolo.setMissao(this);
    }
    
    // ----------------------------------------------------
    // Getters e Setters
    // ----------------------------------------------------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getObjetivo() { return objetivo; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }
    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
    public StatusMissao getStatus() { return status; }
    public void setStatus(StatusMissao status) { this.status = status; }
    public String getTipoSimulacao() { return tipoSimulacao; }
    public void setTipoSimulacao(String tipoSimulacao) { this.tipoSimulacao = tipoSimulacao; }
    public List<Astronauta> getTripulacao() { return tripulacao; }
    public void setTripulacao(List<Astronauta> tripulacao) { this.tripulacao = tripulacao; }
    
    // Novos Getters e Setters
    public OperadorDeMissao getOperadorResponsavel() { return operadorResponsavel; }
    public void setOperadorResponsavel(OperadorDeMissao operadorResponsavel) { this.operadorResponsavel = operadorResponsavel; }
    public Espaconave getEspaconave() { return espaconave; }
    public void setEspaconave(Espaconave espaconave) { this.espaconave = espaconave; }
    public List<Simulacao> getSimulacoes() { return simulacoes; }
    public void setSimulacoes(List<Simulacao> simulacoes) { this.simulacoes = simulacoes; }
    public List<ProtocoloEmergencial> getProtocolos() { return protocolos; }
    public void setProtocolos(List<ProtocoloEmergencial> protocolos) { this.protocolos = protocolos; }
    public List<Evento> getEventos() { return eventos; }
    public void setEventos(List<Evento> eventos) { this.eventos = eventos; }
}