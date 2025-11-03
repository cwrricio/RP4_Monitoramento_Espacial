package com.MonitoramentoEspacial.aplicacao.dominio;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Representa a espaçonave utilizada em uma ou mais missões.
 */
@Entity
@Table(name = "espaconave")
public class Espaconave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    private int capacidadeTripulacao;
    private String statusOperacional; // Ex: "OPERACIONAL", "EM_MANUTENCAO", "DESATIVADA"

    /**
     * Uma espaçonave pode ser usada em muitas missões.
     * mappedBy indica que a entidade 'Missao' é dona do relacionamento (no campo 'espaconave').
     */
    @OneToMany(
        mappedBy = "espaconave",
        cascade = CascadeType.PERSIST, // Não quebrar a espaçonave se a missão for deletada
        fetch = FetchType.LAZY
    )
    private List<Missao> missoes = new ArrayList<>();

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public int getCapacidadeTripulacao() {
        return capacidadeTripulacao;
    }

    public void setCapacidadeTripulacao(int capacidadeTripulacao) {
        this.capacidadeTripulacao = capacidadeTripulacao;
    }

    public String getStatusOperacional() {
        return statusOperacional;
    }

    public void setStatusOperacional(String statusOperacional) {
        this.statusOperacional = statusOperacional;
    }

    public List<Missao> getMissoes() {
        return missoes;
    }

    public void setMissoes(List<Missao> missoes) {
        this.missoes = missoes;
    }
}