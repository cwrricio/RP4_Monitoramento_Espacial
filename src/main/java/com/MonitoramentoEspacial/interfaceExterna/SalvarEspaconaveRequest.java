package com.MonitoramentoEspacial.interfaceExterna;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SalvarEspaconaveRequest {

    @NotBlank(message = "Nome não pode ser vazio")
    private String nome;

    @NotNull
    @Min(value = 1, message = "Capacidade deve ser ao menos 1")
    private Integer capacidade;

    @NotBlank(message = "Status operacional não pode ser vazio")
    private String statusOperacional;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Integer getCapacidade() { return capacidade; }
    public void setCapacidade(Integer capacidade) { this.capacidade = capacidade; }
    public String getStatusOperacional() { return statusOperacional; }
    public void setStatusOperacional(String statusOperacional) { this.statusOperacional = statusOperacional; }
}