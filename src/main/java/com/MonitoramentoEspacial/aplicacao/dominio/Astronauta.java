package com.MonitoramentoEspacial.aplicacao.dominio;

import jakarta.persistence.*;

@Entity
@Table(name = "astronauta")
public class Astronauta extends Funcionario {

    private String nivelAptidaoMedica;
    private int missoesRealizadas;

    @OneToOne(cascade = CascadeType.ALL)
    private DadosBiometricos dadosBiometricos;

    public String getNivelAptidaoMedica() { return nivelAptidaoMedica; }
    public void setNivelAptidaoMedica(String nivelAptidaoMedica) { this.nivelAptidaoMedica = nivelAptidaoMedica; }

    public int getMissoesRealizadas() { return missoesRealizadas; }
    public void setMissoesRealizadas(int missoesRealizadas) { this.missoesRealizadas = missoesRealizadas; }

    public DadosBiometricos getDadosBiometricos() { return dadosBiometricos; }
    public void setDadosBiometricos(DadosBiometricos dadosBiometricos) { this.dadosBiometricos = dadosBiometricos; }

    // Método do diagrama
    public DadosBiometricos obterDadosVitais() {
        return this.dadosBiometricos;
    }
}
