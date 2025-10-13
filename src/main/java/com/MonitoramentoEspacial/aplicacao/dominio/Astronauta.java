package com.MonitoramentoEspacial.aplicacao.dominio;

import jakarta.persistence.*;

@Entity
@Table(name = "astronauta")
public class Astronauta extends Funcionario {

    private String nivelAptidaoMedica;
    private int missoesRealizadas;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "dados_biometricos_id")
    private DadosBiometricos dadosBiometricos;

    public String getNivelAptidaoMedica() { return nivelAptidaoMedica; }
    public void setNivelAptidaoMedica(String nivelAptidaoMedica) { this.nivelAptidaoMedica = nivelAptidaoMedica; }
    
    public int getMissoesRealizadas() { return missoesRealizadas; }
    public void setMissoesRealizadas(int missoesRealizadas) { this.missoesRealizadas = missoesRealizadas; }
    
    public DadosBiometricos getDadosBiometricos() { return dadosBiometricos; }
    public void setDadosBiometricos(DadosBiometricos dadosBiometricos) { this.dadosBiometricos = dadosBiometricos; }


    public boolean podeSerTripulante() {
        final String NIVEL_REQUERIDO = "APTO"; 
        
        boolean temAptidaoMedica = NIVEL_REQUERIDO.equalsIgnoreCase(this.nivelAptidaoMedica);

        return this.isAtivo() && temAptidaoMedica;
    }
}