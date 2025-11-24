package com.MonitoramentoEspacial.interfaceExterna;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class CriarMissaoRequest {

    @NotBlank(message = "O nome da missão é obrigatório")
    private String nome;

    @NotBlank(message = "O objetivo é obrigatório")
    private String objetivo;

    @NotNull(message = "A data de início é obrigatória")
    private LocalDate dataInicio;

    // O Frontend deve enviar uma lista de números: [1, 2, 5]
    private List<Long> tripulacaoIds;

    // --- Construtor Vazio (Obrigatório para o JSON funcionar) ---
    public CriarMissaoRequest() {
    }

    // --- Construtor Completo ---
    public CriarMissaoRequest(String nome, String objetivo, LocalDate dataInicio, List<Long> tripulacaoIds) {
        this.nome = nome;
        this.objetivo = objetivo;
        this.dataInicio = dataInicio;
        this.tripulacaoIds = tripulacaoIds;
    }

    // --- Getters e Setters ---
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getObjetivo() { return objetivo; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public List<Long> getTripulacaoIds() { return tripulacaoIds; }
    public void setTripulacaoIds(List<Long> tripulacaoIds) { this.tripulacaoIds = tripulacaoIds; }
}