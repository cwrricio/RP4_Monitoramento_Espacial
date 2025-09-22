package com.MonitoramentoEspacial.aplicacao;

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
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getNivelAptidaoMedica() { return nivelAptidaoMedica; }
    public void setNivelAptidaoMedica(String nivelAptidaoMedica) { this.nivelAptidaoMedica = nivelAptidaoMedica; }

    public DadosBiometricos getDadosBiometricos() { return dadosBiometricos; }
    public void setDadosBiometricos(DadosBiometricos dadosBiometricos) { this.dadosBiometricos = dadosBiometricos; }
}
