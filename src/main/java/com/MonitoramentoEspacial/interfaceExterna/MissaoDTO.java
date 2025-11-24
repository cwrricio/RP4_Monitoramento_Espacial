package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.dominio.StatusMissao;
import java.time.LocalDate;
import java.util.List;

public class MissaoDTO {

    private Long id;
    private String nome;
    private String objetivo;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private StatusMissao status;
    private List<Long> tripulacaoIds;

    // --- CONSTRUTOR VAZIO (Obrigatório para frameworks JSON) ---
    public MissaoDTO() {
    }

    // Construtor Completo
    public MissaoDTO(Long id, String nome, String objetivo, LocalDate dataInicio, LocalDate dataFim, StatusMissao status, List<Long> tripulacaoIds) {
        this.id = id;
        this.nome = nome;
        this.objetivo = objetivo;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.status = status;
        this.tripulacaoIds = tripulacaoIds;
    }

    // --- GETTERS ---
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getObjetivo() { return objetivo; }
    public LocalDate getDataInicio() { return dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public StatusMissao getStatus() { return status; }
    public List<Long> getTripulacaoIds() { return tripulacaoIds; }

    // --- SETTERS (Obrigatórios para frameworks JSON) ---
    public void setId(Long id) { this.id = id; }
    public void setNome(String nome) { this.nome = nome; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
    public void setStatus(StatusMissao status) { this.status = status; }
    public void setTripulacaoIds(List<Long> tripulacaoIds) { this.tripulacaoIds = tripulacaoIds; }
}