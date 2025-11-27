package com.MonitoramentoEspacial.interfaceExterna;

import java.time.LocalDate;
import java.util.List;

public class AtualizarMissaoRequest {
    private String nome;
    private String objetivo;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private List<Long> tripulacaoIds;

    // Getters e Setters
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getObjetivo() { return objetivo; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }
    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
    public List<Long> getTripulacaoIds() { return tripulacaoIds; }
    public void setTripulacaoIds(List<Long> tripulacaoIds) { this.tripulacaoIds = tripulacaoIds; }
}