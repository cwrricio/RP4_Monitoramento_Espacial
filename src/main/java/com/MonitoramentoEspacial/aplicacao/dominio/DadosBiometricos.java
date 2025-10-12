package com.MonitoramentoEspacial.aplicacao.dominio;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class DadosBiometricos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;
    private String valor;
    private String unidade;
    private LocalDateTime registradoEm = LocalDateTime.now();

    public Long getId() { return id; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getValor() { return valor; }
    public void setValor(String valor) { this.valor = valor; }

    public String getUnidade() { return unidade; }
    public void setUnidade(String unidade) { this.unidade = unidade; }

    public LocalDateTime getRegistradoEm() { return registradoEm; }
    public void setRegistradoEm(LocalDateTime registradoEm) { this.registradoEm = registradoEm; }
}
