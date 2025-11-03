package com.MonitoramentoEspacial.interfaceExterna;

/**
 * DTO para exibir dados de uma Espaconave.
 */
public class EspaconaveDTO {
    private Long id;
    private String nome;
    private int capacidadeTripulacao;
    private String statusOperacional;

    public EspaconaveDTO(Long id, String nome, int capacidadeTripulacao, String statusOperacional) {
        this.id = id;
        this.nome = nome;
        this.capacidadeTripulacao = capacidadeTripulacao;
        this.statusOperacional = statusOperacional;
    }

    // Getters
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public int getCapacidadeTripulacao() { return capacidadeTripulacao; }
    public String getStatusOperacional() { return statusOperacional; }
}