package com.MonitoramentoEspacial.interfaceExterna;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public class CriarMissaoRequest {

    @NotBlank(message = "O nome da missão é obrigatório")
    @Size(min = 3, max = 100)
    private String nome;

    @NotBlank(message = "O objetivo da missão é obrigatório")
    @Size(max = 500)
    private String objetivo;

    @FutureOrPresent(message = "A data de início deve ser no presente ou futuro")
    private LocalDate dataInicio;

    @NotEmpty(message = "A missão deve ter pelo menos um astronauta")
    private List<Long> tripulacaoIds;

    // Getters e Setters
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getObjetivo() { return objetivo; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public List<Long> getTripulacaoIds() { return tripulacaoIds; }
    public void setTripulacaoIds(List<Long> tripulacaoIds) { this.tripulacaoIds = tripulacaoIds; }
    
}
