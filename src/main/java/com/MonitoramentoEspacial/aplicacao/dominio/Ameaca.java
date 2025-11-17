package com.MonitoramentoEspacial.aplicacao.dominio;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ameaca")
public class Ameaca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoAmeaca tipo;

    private String descricao;

    // De 1 a 10? serase que fica legal??? kskks
    private int nivelPerigo;
    
    private double distanciaKm;

    private LocalDateTime detectadaEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "missao_id", nullable = false)
    private Missao missao;

    public Ameaca() {
        this.detectadaEm = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public TipoAmeaca getTipo() { return tipo; }
    public void setTipo(TipoAmeaca tipo) { this.tipo = tipo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public int getNivelPerigo() { return nivelPerigo; }
    public void setNivelPerigo(int nivelPerigo) { this.nivelPerigo = nivelPerigo; }
    public double getDistanciaKm() { return distanciaKm; }
    public void setDistanciaKm(double distanciaKm) { this.distanciaKm = distanciaKm; }
    public LocalDateTime getDetectadaEm() { return detectadaEm; }
    public void setDetectadaEm(LocalDateTime detectadaEm) { this.detectadaEm = detectadaEm; }
    public Missao getMissao() { return missao; }
    public void setMissao(Missao missao) { this.missao = missao; }
}