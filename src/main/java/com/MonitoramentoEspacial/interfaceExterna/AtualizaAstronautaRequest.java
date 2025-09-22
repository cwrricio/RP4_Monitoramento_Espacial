package com.MonitoramentoEspacial.interfaceExterna;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public class AtualizaAstronautaRequest {

    @NotBlank(message = "Nome não pode ser vazio")
    @Size(min = 2, max = 100)
    private String nome;

    @NotBlank(message = "Nível de aptidão médica deve ser informado")
    private String nivelAptidaoMedica;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getNivelAptidaoMedica() { return nivelAptidaoMedica; }
    public void setNivelAptidaoMedica(String nivelAptidaoMedica) { this.nivelAptidaoMedica = nivelAptidaoMedica; }
}
