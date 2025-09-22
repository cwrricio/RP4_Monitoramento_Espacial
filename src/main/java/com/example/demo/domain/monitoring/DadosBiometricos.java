package com.example.demo.domain.monitoring;

import com.example.demo.domain.people.Astronauta;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dados_biometricos")
public class DadosBiometricos {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;
    private Double valor;
    private String unidade;
    private LocalDateTime dataHora;

    @ManyToOne(optional = false)
    @JoinColumn(name = "astronauta_id")
    private Astronauta astronauta;

    public Long getId() { return id; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public Double getValor() { return valor; }
    public void setValor(Double valor) { this.valor = valor; }
    public String getUnidade() { return unidade; }
    public void setUnidade(String unidade) { this.unidade = unidade; }
    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
    public Astronauta getAstronauta() { return astronauta; }
    public void setAstronauta(Astronauta astronauta) { this.astronauta = astronauta; }
}
