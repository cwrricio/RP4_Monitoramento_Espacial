package com.MonitoramentoEspacial.interfaceExterna;

public class AstronautaDTO {
    private Long id;
    private String nome;
    private String nivelAptidaoMedica;

    public AstronautaDTO(Long id, String nome, String nivelAptidaoMedica) {
        this.id = id;
        this.nome = nome;
        this.nivelAptidaoMedica = nivelAptidaoMedica;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getNivelAptidaoMedica() { return nivelAptidaoMedica; }
}
