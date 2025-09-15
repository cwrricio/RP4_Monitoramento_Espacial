package com.example.demo.domain.mission;

import com.example.demo.domain.people.Astronauta;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "missoes")
public class Missao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String codigo; // Ex: "MARS-2025-001"
    
    @Column(nullable = false)
    private String nome;
    
    @Column(length = 2000)
    private String descricao;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMissao tipo;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusMissao status = StatusMissao.PLANEJAMENTO;
    
    @Enumerated(EnumType.STRING)
    private NivelPrioridade prioridade = NivelPrioridade.MEDIA;
    
    @Column(nullable = false)
    private LocalDateTime dataInicioPlanejada;
    
    private LocalDateTime dataFimPlanejada;
    
    private LocalDateTime dataInicioReal;
    
    private LocalDateTime dataFimReal;
    
    // Relacionamento com astronautas
    @ManyToMany
    @JoinTable(
        name = "missao_astronauta",
        joinColumns = @JoinColumn(name = "missao_id"),
        inverseJoinColumns = @JoinColumn(name = "astronauta_id")
    )
    private Set<Astronauta> tripulacao = new HashSet<>();
    
    @ManyToOne
    @JoinColumn(name = "comandante_id")
    private Astronauta comandante;
    
    // Dados de telemetria e monitoramento
    @OneToMany(mappedBy = "missao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Telemetria> telemetrias = new ArrayList<>();
    
    @OneToMany(mappedBy = "missao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventoMissao> eventos = new ArrayList<>();
    
    @OneToMany(mappedBy = "missao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProtocoloEmergencia> protocolosEmergencia = new ArrayList<>();
    
    // Métricas e KPIs
    @Embedded
    private MetricasMissao metricas = new MetricasMissao();
    
    // Configurações da missão
    @Embedded
    private ConfiguracaoMissao configuracao = new ConfiguracaoMissao();
    
    // Auditoria
    @Column(nullable = false, updatable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();
    
    private LocalDateTime dataUltimaAtualizacao;
    
    @PreUpdate
    protected void onUpdate() {
        dataUltimaAtualizacao = LocalDateTime.now();
    }
    
    // Métodos de negócio
    public void iniciarMissao() {
        if (status != StatusMissao.PRONTA) {
            throw new IllegalStateException("Missão não está pronta para iniciar");
        }
        this.status = StatusMissao.EM_ANDAMENTO;
        this.dataInicioReal = LocalDateTime.now();
        registrarEvento("MISSAO_INICIADA", "Missão iniciada com sucesso");
    }
    
    public void pausarMissao(String motivo) {
        if (status != StatusMissao.EM_ANDAMENTO) {
            throw new IllegalStateException("Apenas missões em andamento podem ser pausadas");
        }
        this.status = StatusMissao.PAUSADA;
        registrarEvento("MISSAO_PAUSADA", motivo);
    }
    
    public void retomarMissao() {
        if (status != StatusMissao.PAUSADA) {
            throw new IllegalStateException("Apenas missões pausadas podem ser retomadas");
        }
        this.status = StatusMissao.EM_ANDAMENTO;
        registrarEvento("MISSAO_RETOMADA", "Missão retomada");
    }
    
    public void finalizarMissao(boolean sucesso) {
        if (status != StatusMissao.EM_ANDAMENTO && status != StatusMissao.EMERGENCIA) {
            throw new IllegalStateException("Estado inválido para finalização");
        }
        this.status = sucesso ? StatusMissao.CONCLUIDA : StatusMissao.ABORTADA;
        this.dataFimReal = LocalDateTime.now();
        registrarEvento(sucesso ? "MISSAO_CONCLUIDA" : "MISSAO_ABORTADA", 
                       sucesso ? "Missão concluída com sucesso" : "Missão abortada");
    }
    
    public void ativarEmergencia(String descricao) {
        this.status = StatusMissao.EMERGENCIA;
        registrarEvento("EMERGENCIA_ATIVADA", descricao);
        
        // Ativar protocolos de emergência relevantes
        protocolosEmergencia.stream()
            .filter(p -> p.isAplicavel())
            .forEach(ProtocoloEmergencia::ativar);
    }
    
    public void adicionarTripulante(Astronauta astronauta) {
        if (status != StatusMissao.PLANEJAMENTO && status != StatusMissao.PRONTA) {
            throw new IllegalStateException("Não é possível alterar tripulação neste estado");
        }
        tripulacao.add(astronauta);
        registrarEvento("TRIPULANTE_ADICIONADO", "Astronauta " + astronauta.getNome() + " adicionado");
    }
    
    public void removerTripulante(Astronauta astronauta) {
        if (status == StatusMissao.EM_ANDAMENTO || status == StatusMissao.EMERGENCIA) {
            throw new IllegalStateException("Não é possível remover tripulante durante missão ativa");
        }
        tripulacao.remove(astronauta);
        if (comandante != null && comandante.equals(astronauta)) {
            comandante = null;
        }
        registrarEvento("TRIPULANTE_REMOVIDO", "Astronauta " + astronauta.getNome() + " removido");
    }
    
    public void definirComandante(Astronauta astronauta) {
        if (!tripulacao.contains(astronauta)) {
            throw new IllegalArgumentException("Comandante deve fazer parte da tripulação");
        }
        this.comandante = astronauta;
        registrarEvento("COMANDANTE_DEFINIDO", "Astronauta " + astronauta.getNome() + " definido como comandante");
    }
    
    private void registrarEvento(String tipo, String descricao) {
        EventoMissao evento = new EventoMissao();
        evento.setMissao(this);
        evento.setTipo(tipo);
        evento.setDescricao(descricao);
        evento.setDataHora(LocalDateTime.now());
        eventos.add(evento);
    }
    
    public boolean isAtiva() {
        return status == StatusMissao.EM_ANDAMENTO || 
               status == StatusMissao.PAUSADA || 
               status == StatusMissao.EMERGENCIA;
    }
    
    public boolean podeSerEditada() {
        return status == StatusMissao.PLANEJAMENTO || status == StatusMissao.PRONTA;
    }
    
    // Get e Sey
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    
    public TipoMissao getTipo() { return tipo; }
    public void setTipo(TipoMissao tipo) { this.tipo = tipo; }
    
    public StatusMissao getStatus() { return status; }
    public void setStatus(StatusMissao status) { this.status = status; }
    
    public NivelPrioridade getPrioridade() { return prioridade; }
    public void setPrioridade(NivelPrioridade prioridade) { this.prioridade = prioridade; }
    
    public LocalDateTime getDataInicioPlanejada() { return dataInicioPlanejada; }
    public void setDataInicioPlanejada(LocalDateTime data) { this.dataInicioPlanejada = data; }
    
    public LocalDateTime getDataFimPlanejada() { return dataFimPlanejada; }
    public void setDataFimPlanejada(LocalDateTime data) { this.dataFimPlanejada = data; }
    
    public LocalDateTime getDataInicioReal() { return dataInicioReal; }
    public void setDataInicioReal(LocalDateTime data) { this.dataInicioReal = data; }
    
    public LocalDateTime getDataFimReal() { return dataFimReal; }
    public void setDataFimReal(LocalDateTime data) { this.dataFimReal = data; }
    
    public Set<Astronauta> getTripulacao() { return tripulacao; }
    public void setTripulacao(Set<Astronauta> tripulacao) { this.tripulacao = tripulacao; }
    
    public Astronauta getComandante() { return comandante; }
    public void setComandante(Astronauta comandante) { this.comandante = comandante; }
    
    public List<Telemetria> getTelemetrias() { return telemetrias; }
    public List<EventoMissao> getEventos() { return eventos; }
    public List<ProtocoloEmergencia> getProtocolosEmergencia() { return protocolosEmergencia; }
    
    public void setTipo(String tipoStr) {
    if (tipoStr == null) {
        this.tipo = null;
        return;
    }
    try {
        this.tipo = TipoMissao.valueOf(tipoStr.toUpperCase());
    } catch (IllegalArgumentException e) {
        throw new IllegalArgumentException("Tipo da missão inválido: " + tipoStr);
    }
}

public void setStatus(String statusStr) {
    if (statusStr == null) {
        this.status = null;
        return;
    }
    try {
        this.status = StatusMissao.valueOf(statusStr.toUpperCase());
    } catch (IllegalArgumentException e) {
        throw new IllegalArgumentException("Status da missão inválido: " + statusStr);
    }
}



    public MetricasMissao getMetricas() { return metricas; }
    public void setMetricas(MetricasMissao metricas) { this.metricas = metricas; }
    
    public ConfiguracaoMissao getConfiguracao() { return configuracao; }
    public void setConfiguracao(ConfiguracaoMissao config) { this.configuracao = config; }
    
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public LocalDateTime getDataUltimaAtualizacao() { return dataUltimaAtualizacao; }
}
