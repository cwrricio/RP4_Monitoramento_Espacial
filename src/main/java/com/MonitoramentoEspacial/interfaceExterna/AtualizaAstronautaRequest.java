package com.MonitoramentoEspacial.interfaceExterna;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AtualizaAstronautaRequest {

    @NotBlank(message = "Nome não pode ser vazio")
    @Size(min = 2, max = 100)
    private String nome;

    @NotBlank(message = "Cargo deve ser informado")
    private String cargo;

    @NotNull(message = "Idade deve ser informada")
    private Integer idade;

    @NotNull(message = "Status ativo deve ser informado")
    private Boolean ativo;

    @NotBlank(message = "Nível de aptidão médica deve ser informado")
    private String nivelAptidaoMedica;

    @NotNull(message = "Número de missões realizadas deve ser informado")
    private Integer missoesRealizadas;

    // Dados biométricos
    private String tipoBiometria;
    private String valorBiometria;
    private String unidadeBiometria;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }

    public Integer getIdade() { return idade; }
    public void setIdade(Integer idade) { this.idade = idade; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public String getNivelAptidaoMedica() { return nivelAptidaoMedica; }
    public void setNivelAptidaoMedica(String nivelAptidaoMedica) { this.nivelAptidaoMedica = nivelAptidaoMedica; }

    public Integer getMissoesRealizadas() { return missoesRealizadas; }
    public void setMissoesRealizadas(Integer missoesRealizadas) { this.missoesRealizadas = missoesRealizadas; }

    public String getTipoBiometria() { return tipoBiometria; }
    public void setTipoBiometria(String tipoBiometria) { this.tipoBiometria = tipoBiometria; }

    public String getValorBiometria() { return valorBiometria; }
    public void setValorBiometria(String valorBiometria) { this.valorBiometria = valorBiometria; }

    public String getUnidadeBiometria() { return unidadeBiometria; }
    public void setUnidadeBiometria(String unidadeBiometria) { this.unidadeBiometria = unidadeBiometria; }
}
