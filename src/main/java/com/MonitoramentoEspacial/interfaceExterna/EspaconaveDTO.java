package com.MonitoramentoEspacial.interfaceExterna;

/**
 * DTO para exibir dados de uma Espaconave.
 *
 * ATUALIZADO:
 * 1. Renomeado 'capacidadeTripulacao' para 'capacidade' (para bater com o Mapper e o Frontend).
 * 2. Adicionado um construtor vazio (necessário para MapStruct/Jackson).
 * 3. Adicionados Setters (necessários para MapStruct/Jackson).
 */
public class EspaconaveDTO {
    private Long id;
    private String nome;
    
    private int capacidade; 
    
    private String statusOperacional;

    // --- CONSTRUTORES ---

    /**
     * Construtor vazio (sem argumentos)
     * O MapStruct e o Jackson (JSON) precisam disto para instanciar o objeto.
     */
    public EspaconaveDTO() {
    }

    /**
     * Construtor completo
     */
    public EspaconaveDTO(Long id, String nome, int capacidade, String statusOperacional) {
        this.id = id;
        this.nome = nome;
        this.capacidade = capacidade;
        this.statusOperacional = statusOperacional;
    }

    // --- GETTERS E SETTERS ---
    // (MapStruct e Jackson precisam disto)

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public int getCapacidade() { return capacidade; }
    public void setCapacidade(int capacidade) { this.capacidade = capacidade; }

    public String getStatusOperacional() { return statusOperacional; }
    public void setStatusOperacional(String statusOperacional) { this.statusOperacional = statusOperacional; }
}