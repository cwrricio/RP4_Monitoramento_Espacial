package com.MonitoramentoEspacial.aplicacao.dominio;

import jakarta.persistence.*;

@Entity
public class Funcionario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String cargo; // gestão de pessoal/permissões

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCargo() { return cargo; }

    public void setNome(String nome) { this.nome = nome; }
    public void setCargo(String cargo) { this.cargo = cargo; }
}
