package com.MonitoramentoEspacial.aplicacao.dominio;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "simulacao")
public class Simulacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeParametros;
    private LocalDateTime dataSimulacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResultadoSimulacao resultado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "missao_id", nullable = false)
    private Missao missao;

    public Simulacao() {
        this.dataSimulacao = LocalDateTime.now();
        this.resultado = ResultadoSimulacao.PENDENTE;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNomeParametros() { return nomeParametros; }
    public void setNomeParametros(String nomeParametros) { this.nomeParametros = nomeParametros; }
    public LocalDateTime getDataSimulacao() { return dataSimulacao; }
    public void setDataSimulacao(LocalDateTime dataSimulacao) { this.dataSimulacao = dataSimulacao; }
    public ResultadoSimulacao getResultado() { return resultado; }
    public void setResultado(ResultadoSimulacao resultado) { this.resultado = resultado; }
    public Missao getMissao() { return missao; }
    public void setMissao(Missao missao) { this.missao = missao; }
}