package com.MonitoramentoEspacial.aplicacao.dominio;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "missao")
public class Missao {

    // ... atributos e anotações Jpa (iguais) ...
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(length = 500)
    private String objetivo;

    private LocalDate dataInicio;
    private LocalDate dataFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusMissao status;

    @ManyToMany
    @JoinTable(
        name = "missao_astronauta",
        joinColumns = @JoinColumn(name = "missao_id"),
        inverseJoinColumns = @JoinColumn(name = "astronauta_id")
    )
    private List<Astronauta> tripulacao = new ArrayList<>();
    
    // Construtor vazio para JPA
    public Missao() {}


    // ----------------------------------------------------
    // METODOS DE DOMÍNIO (Comportamento) - Enriquecendo o modelo
    // ----------------------------------------------------

    /**
     * Inicia a simulação, alterando o status e registrando a data.
     * @throws IllegalStateException se a missão não estiver PLANEJADA.
     */
    public void iniciarSimulacao() {
        if (this.status != StatusMissao.PLANEJADA) {
            throw new IllegalStateException("A simulação só pode ser iniciada se a missão estiver PLANEJADA.");
        }
        this.status = StatusMissao.EM_ANDAMENTO;
        this.dataInicio = LocalDate.now();
    }


    /**
 * Método de Domínio para associar e validar a tripulação.
 * Delega a validação de aptidão para a própria entidade Astronauta (Coesão).
 * @param novosTripulantes a lista de astronautas a serem escalados.
 * @throws IllegalArgumentException se houver astronautas inaptos.
 */
public void associarTripulacao(List<Astronauta> novosTripulantes) {
    if (novosTripulantes == null || novosTripulantes.isEmpty()) {
        throw new IllegalArgumentException("A tripulação de uma missão não pode ser vazia.");
    }
    
    // Filtra e coleta os inaptos, usando o método de domínio do Astronauta
    List<Astronauta> astronautasInaptos = novosTripulantes.stream()
        .filter(a -> !a.podeSerTripulante())
        .collect(Collectors.toList());

    if (!astronautasInaptos.isEmpty()) {
        String nomes = astronautasInaptos.stream().map(Astronauta::getNome).collect(Collectors.joining(", "));
        throw new IllegalArgumentException("Os seguintes astronautas estão inaptos para a missão: " + nomes + 
                                           ". Verifique o status 'ativo' e o 'nível de aptidão médica'.");
    }

    // Se todos aptos, associa.
    this.tripulacao.clear(); // Limpa se for um update
    this.tripulacao.addAll(novosTripulantes);
}
    
    

    // ----------------------------------------------------
    // Getters e Setters (para JPA, mas preferir métodos de domínio)
    // ----------------------------------------------------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getObjetivo() { return objetivo; }
    public void setObjetivo(String objetivo) { this.objetivo = objetivo; }
    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
    public StatusMissao getStatus() { return status; }
    public void setStatus(StatusMissao status) { this.status = status; }
    public List<Astronauta> getTripulacao() { return tripulacao; }

    // Manter o setter privado ou removê-lo se for para usar apenas o método de domínio
    // Para JPA, pode ser útil manter, mas deve-se favorecer o método associarTripulacao
    public void setTripulacao(List<Astronauta> tripulacao) { this.tripulacao = tripulacao; }
}