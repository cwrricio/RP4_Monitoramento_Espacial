package com.MonitoramentoEspacial.aplicacao.dominio;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Representa um protocolo de emergência que pode ser acionado durante uma missão.
 */
@Entity
@Table(name = "protocolo_emergencial")
public class ProtocoloEmergencial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String descricao;
    
    private LocalDateTime acionadoEm;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoProtocolo tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "missao_id", nullable = false)
    private Missao missao;

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDateTime getAcionadoEm() {
        return acionadoEm;
    }

    public void setAcionadoEm(LocalDateTime acionadoEm) {
        this.acionadoEm = acionadoEm;
    }

    public TipoProtocolo getTipo() {
        return tipo;
    }

    public void setTipo(TipoProtocolo tipo) {
        this.tipo = tipo;
    }

    public Missao getMissao() {
        return missao;
    }

    public void setMissao(Missao missao) {
        this.missao = missao;
    }
}