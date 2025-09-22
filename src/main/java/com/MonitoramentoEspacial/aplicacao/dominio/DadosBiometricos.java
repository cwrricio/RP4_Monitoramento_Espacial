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
    private LocalDateTime registradoEm = LocalDateTime.now();

    public Long getId() { return id; }
    public String getTipo() { return tipo; }
    public String getValor() { return valor; }
    public LocalDateTime getRegistradoEm() { return registradoEm; }

    public void setTipo(String tipo) { this.tipo = tipo; }
    public void setValor(String valor) { this.valor = valor; }

    // Regra de negócio simples
    public boolean isCritico() {
        try {
            double val = Double.parseDouble(valor);
            return val < 50 || val > 180; // exemplo genérico
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
