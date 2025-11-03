package com.MonitoramentoEspacial.aplicacao.dominio;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * Representa um Operador de Missão, que é um tipo de Funcionário.
 * Herda os atributos básicos de Funcionario.
 */
@Entity
@Table(name = "operador_de_missao")
public class OperadorDeMissao extends Funcionario {

    private String turno; // Ex: "Integral", "Noturno", "Diurno"
    private String areaEspecializacao; // Ex: "Controle de Voo", "Comunicações"

    // Getters e Setters
    public String getTurno() {
        return turno;
    }

    public void setTurno(String turno) {
        this.turno = turno;
    }

    public String getAreaEspecializacao() {
        return areaEspecializacao;
    }

    public void setAreaEspecializacao(String areaEspecializacao) {
        this.areaEspecializacao = areaEspecializacao;
    }
}