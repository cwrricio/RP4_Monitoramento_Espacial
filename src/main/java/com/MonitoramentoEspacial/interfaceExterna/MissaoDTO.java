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

    // Construtor, Getters e Setters
    public MissaoDTO(Long id, String nome, String objetivo, LocalDate dataInicio, LocalDate dataFim, StatusMissao status, List<Long> tripulacaoIds) {
        this.id = id;
        this.nome = nome;
        this.objetivo = objetivo;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.status = status;
        this.tripulacaoIds = tripulacaoIds;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getObjetivo() { return objetivo; }
    public LocalDate getDataInicio() { return dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public StatusMissao getStatus() { return status; }
    public List<Long> getTripulacaoIds() { return tripulacaoIds; }
    
    
}
