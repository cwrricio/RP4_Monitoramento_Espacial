package com.MonitoramentoEspacial.interfaceExterna;

import java.time.LocalDateTime;

public class AstronautaDTO {
    private Long id;
    private String nome;
    private String cargo;
    private Integer idade;
    private Boolean ativo;
    private String nivelAptidaoMedica;
    private Integer missoesRealizadas;

    // Dados biométricos
    private String tipoBiometria;
    private String valorBiometria;
    private String unidadeBiometria;
    private LocalDateTime registradoEm;

    public AstronautaDTO(Long id, String nome, Integer idade, Boolean ativo,
                         String nivelAptidaoMedica, Integer missoesRealizadas,
                         String tipoBiometria, String valorBiometria,
                         String unidadeBiometria, LocalDateTime registradoEm) {
        this.id = id;
        this.nome = nome;
        this.idade = idade;
        this.ativo = ativo;
        this.nivelAptidaoMedica = nivelAptidaoMedica;
        this.missoesRealizadas = missoesRealizadas;
        this.tipoBiometria = tipoBiometria;
        this.valorBiometria = valorBiometria;
        this.unidadeBiometria = unidadeBiometria;
        this.registradoEm = registradoEm;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCargo() { return cargo; }
    public Integer getIdade() { return idade; }
    public Boolean getAtivo() { return ativo; }
    public String getNivelAptidaoMedica() { return nivelAptidaoMedica; }
    public Integer getMissoesRealizadas() { return missoesRealizadas; }
    public String getTipoBiometria() { return tipoBiometria; }
    public String getValorBiometria() { return valorBiometria; }
    public String getUnidadeBiometria() { return unidadeBiometria; }
    public LocalDateTime getRegistradoEm() { return registradoEm; }
}
