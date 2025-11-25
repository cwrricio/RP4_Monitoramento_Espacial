package com.MonitoramentoEspacial.aplicacao.dominio;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
@Entity
@Table(name = "astronauta")
public class Astronauta extends Funcionario {

    private String nivelAptidaoMedica;
    private int missoesRealizadas;

    @OneToMany(
        mappedBy = "astronauta",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )

    private List<DadosBiometricos> dadosBiometricos = new ArrayList<>();

    public List<DadosBiometricos> getDadosBiometricos() {
        return dadosBiometricos;
    }

    public void setDadosBiometricos(List<DadosBiometricos> dadosBiometricos) {
        this.dadosBiometricos = dadosBiometricos;
    }

    public String getNivelAptidaoMedica() { return nivelAptidaoMedica; }
    public void setNivelAptidaoMedica(String nivelAptidaoMedica) { this.nivelAptidaoMedica = nivelAptidaoMedica; }
    
    public int getMissoesRealizadas() { return missoesRealizadas; }
    public void setMissoesRealizadas(int missoesRealizadas) { this.missoesRealizadas = missoesRealizadas; }
    

    public void adicionarDadoBiometrico(DadosBiometricos dado) {
        this.dadosBiometricos.add(dado);
        dado.setAstronauta(this);
    }

    public boolean podeSerTripulante() {
        if (this.nivelAptidaoMedica == null) return false;

        // Aceita "ALTO", "ALTA", "MEDIO", "APTO" - Flexibiliza a regra para bater com o Front
        boolean aptidaoAceita = 
            this.nivelAptidaoMedica.equalsIgnoreCase("ALTO") ||
            this.nivelAptidaoMedica.equalsIgnoreCase("ALTA") ||
            this.nivelAptidaoMedica.equalsIgnoreCase("MEDIO") ||
            this.nivelAptidaoMedica.equalsIgnoreCase("APTO");

        return this.isAtivo() && aptidaoAceita;
    }
}