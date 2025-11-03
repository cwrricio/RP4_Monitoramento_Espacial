package com.MonitoramentoEspacial.interfaceExterna;

/**
 * DTO para exibir dados de um OperadorDeMissao.
 */
public class OperadorDeMissaoDTO {
    private Long id;
    private String nome;
    private int idade;
    private boolean ativo;
    private String turno;
    private String areaEspecializacao;

    // Construtor
    public OperadorDeMissaoDTO(Long id, String nome, int idade, boolean ativo, String turno, String areaEspecializacao) {
        this.id = id;
        this.nome = nome;
        this.idade = idade;
        this.ativo = ativo;
        this.turno = turno;
        this.areaEspecializacao = areaEspecializacao;
    }

    // Getters
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public int getIdade() { return idade; }
    public boolean isAtivo() { return ativo; }
    public String getTurno() { return turno; }
    public String getAreaEspecializacao() { return areaEspecializacao; }
}