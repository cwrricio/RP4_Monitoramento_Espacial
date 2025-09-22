package com.MonitoramentoEspacial.aplicacao.dominio;

import jakarta.persistence.*;

@Entity
public class Astronauta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String nivelAptidaoMedica;

    @OneToOne(cascade = CascadeType.ALL)
    private DadosBiometricos dadosBiometricos;

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getNivelAptidaoMedica() { return nivelAptidaoMedica; }
    public DadosBiometricos getDadosBiometricos() { return dadosBiometricos; }
    public void setDadosBiometricos(DadosBiometricos dadosBiometricos) {
        this.dadosBiometricos = dadosBiometricos;
    }

    // Regras de negócio
    public void atualizarDados(String nome, String nivelAptidaoMedica) {
        this.nome = nome;
        this.nivelAptidaoMedica = nivelAptidaoMedica;
    }

    public boolean isAptoParaMissao() {
        return "ALTO".equalsIgnoreCase(this.nivelAptidaoMedica);
    }
}
