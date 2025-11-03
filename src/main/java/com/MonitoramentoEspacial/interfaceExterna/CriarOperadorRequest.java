package com.MonitoramentoEspacial.interfaceExterna;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Request DTO para Criar um novo OperadorDeMissao.
 */
public class CriarOperadorRequest {

    @NotBlank(message = "Nome não pode ser vazio")
    @Size(min = 2, max = 100)
    private String nome;

    @NotNull(message = "Idade deve ser informada")
    @PositiveOrZero
    private Integer idade;

    @NotNull(message = "Status ativo deve ser informado")
    private Boolean ativo;

    @NotBlank(message = "Turno não pode ser vazio")
    private String turno;

    @NotBlank(message = "Área de especialização não pode ser vazia")
    private String areaEspecializacao;

    // Getters e Setters
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Integer getIdade() { return idade; }
    public void setIdade(Integer idade) { this.idade = idade; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public String getTurno() { return turno; }
    public void setTurno(String turno) { this.turno = turno; }
    public String getAreaEspecializacao() { return areaEspecializacao; }
    public void setAreaEspecializacao(String areaEspecializacao) { this.areaEspecializacao = areaEspecializacao; }
}