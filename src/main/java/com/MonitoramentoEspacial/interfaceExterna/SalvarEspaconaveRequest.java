package com.MonitoramentoEspacial.interfaceExterna;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO para Criar ou Atualizar uma Espaconave.
 */
public class SalvarEspaconaveRequest {

    @NotBlank(message = "Nome não pode ser vazio")
    private String nome;

    @NotNull
    @Min(value = 1, message = "Capacidade deve ser ao menos 1")
    private Integer capacidadeTripulacao;

    @NotBlank(message = "Status operacional não pode ser vazio")
    private String statusOperacional;

    // Getters e Setters
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Integer getCapacidadeTripulacao() { return capacidadeTripulacao; }
    public void setCapacidadeTripulacao(Integer capacidadeTripulacao) { this.capacidadeTripulacao = capacidadeTripulacao; }
    public String getStatusOperacional() { return statusOperacional; }
    public void setStatusOperacional(String statusOperacional) { this.statusOperacional = statusOperacional; }
}