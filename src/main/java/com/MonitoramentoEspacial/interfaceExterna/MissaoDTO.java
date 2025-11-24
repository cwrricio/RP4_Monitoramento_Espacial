package com.MonitoramentoEspacial.interfaceExterna;

import com.fasterxml.jackson.annotation.JsonFormat; // <-- IMPORTAR
import com.MonitoramentoEspacial.aplicacao.dominio.StatusMissao;
import java.time.LocalDate;
import java.util.List;

public class MissaoDTO {

    private Long id;
    private String nome;
    private String objetivo;

    // CORREÇÃO: Garante formato correto na saída JSON
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dataInicio;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dataFim;

    private StatusMissao status;
    private List<Long> tripulacaoIds;

    public MissaoDTO() {
    }

    public MissaoDTO(Long id, String nome, String objetivo, LocalDate dataInicio, LocalDate dataFim, StatusMissao status, List<Long> tripulacaoIds) {
        this.id = id;
        this.nome = nome;
        this.objetivo = objetivo;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.status = status;
        this.tripulacaoIds = tripulacaoIds;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getObjetivo() { return objetivo; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }
    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
    public StatusMissao getStatus() { return status; }
    public void setStatus(StatusMissao status) { this.status = status; }
    public List<Long> getTripulacaoIds() { return tripulacaoIds; }
    public void setTripulacaoIds(List<Long> tripulacaoIds) { this.tripulacaoIds = tripulacaoIds; }
}