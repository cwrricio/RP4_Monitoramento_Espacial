package com.MonitoramentoEspacial.interfaceExterna;

import com.fasterxml.jackson.annotation.JsonFormat; // <-- IMPORTAR ISSO
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
    // CORREÇÃO CRÍTICA: Ensina o Jackson a ler a data
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dataInicio;

    private List<Long> tripulacaoIds;

    public CriarMissaoRequest() {
    }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getObjetivo() { return objetivo; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public List<Long> getTripulacaoIds() { return tripulacaoIds; }
    public void setTripulacaoIds(List<Long> tripulacaoIds) { this.tripulacaoIds = tripulacaoIds; }
}