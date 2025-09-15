package com.example.demo.domain.people;

import com.example.demo.domain.monitoring.DadosBiometricos;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "astronautas")
@PrimaryKeyJoinColumn(name = "funcionario_id")
public class Astronauta extends Funcionario {

    private String nivelAptidaoMedica;
    private Integer missoesRealizadas;

    @OneToMany(mappedBy = "astronauta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DadosBiometricos> biometria = new ArrayList<>();

    public String getNivelAptidaoMedica() { return nivelAptidaoMedica; }
    public void setNivelAptidaoMedica(String v) { this.nivelAptidaoMedica = v; }
    public Integer getMissoesRealizadas() { return missoesRealizadas; }
    public void setMissoesRealizadas(Integer v) { this.missoesRealizadas = v; }
    public List<DadosBiometricos> getBiometria() { return biometria; }
}
