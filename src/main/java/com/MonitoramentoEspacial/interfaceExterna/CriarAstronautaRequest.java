package com.MonitoramentoEspacial.interfaceExterna;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * DTO (Data Transfer Object) para encapsular os dados da requisição de criação
 * de um novo Astronauta. Inclui validações de entrada.
 */
public class CriarAstronautaRequest {

    @NotBlank(message = "Nome não pode ser vazio")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    private String nome;

    @NotNull(message = "Idade deve ser informada")
    @PositiveOrZero(message = "Idade não pode ser negativa")
    private Integer idade;

    @NotNull(message = "Status ativo deve ser informado")
    private Boolean ativo;

    @NotBlank(message = "Nível de aptidão médica deve ser informado")
    private String nivelAptidaoMedica;

    @NotNull(message = "Número de missões realizadas deve ser informado")
    @PositiveOrZero(message = "Número de missões não pode ser negativo")
    private Integer missoesRealizadas;

    // Getters e Setters

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public Integer getIdade() { return idade; }
    public void setIdade(Integer idade) { this.idade = idade; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public String getNivelAptidaoMedica() { return nivelAptidaoMedica; }
    public void setNivelAptidaoMedica(String nivelAptidaoMedica) { this.nivelAptidaoMedica = nivelAptidaoMedica; }

    public Integer getMissoesRealizadas() { return missoesRealizadas; }
    public void setMissoesRealizadas(Integer missoesRealizadas) { this.missoesRealizadas = missoesRealizadas; }
}