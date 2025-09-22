package com.MonitoramentoEspacial.interfaceExterna;

public class AstronautaDTO {
    private Long id;
    private String nome;
    private String nivelAptidaoMedica;
    private String ultimoSinalBiometrico; // resumo biométrico (RF05)

    public AstronautaDTO(Long id, String nome, String nivelAptidaoMedica, String ultimoSinalBiometrico) {
        this.id = id;
        this.nome = nome;
        this.nivelAptidaoMedica = nivelAptidaoMedica;
        this.ultimoSinalBiometrico = ultimoSinalBiometrico;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getNivelAptidaoMedica() { return nivelAptidaoMedica; }
    public String getUltimoSinalBiometrico() { return ultimoSinalBiometrico; }
}
