package com.example.demo.api;

import com.example.demo.api.dto.*;
import com.example.demo.application.MissaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missoes")
@Tag(name = "Missões", description = "API para gerenciamento de missões espaciais")
public class MissaoController {

    private final MissaoService missaoService;

    public MissaoController(MissaoService missaoService) {
        this.missaoService = missaoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar nova missão")
    public MissaoDTO criarMissao(@Valid @RequestBody CriarMissaoRequest request) {
        return missaoService.criarMissao(request);
    }

    @GetMapping
    @Operation(summary = "Listar todas as missões")
    public List<MissaoDTO> listarMissoes() {
        return missaoService.listarMissoes();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter missão por ID")
    public MissaoDTO obterMissao(@PathVariable Long id) {
        return missaoService.obterMissao(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar missão por ID")
    public MissaoDTO atualizarMissao(@PathVariable Long id, @Valid @RequestBody AtualizarMissaoRequest request) {
        return missaoService.atualizarMissao(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Deletar missão por ID")
    public void deletarMissao(@PathVariable Long id) {
        missaoService.deletarMissao(id);
    }

    @PostMapping("/{id}/tripulacao")
    @Operation(summary = "Adicionar astronauta à missão")
    public ResponseEntity<Void> adicionarAstronauta(
            @PathVariable Long id,
            @RequestBody AdicionarTripulanteRequest request) {
        missaoService.adicionarAstronauta(id, request.astronautaId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}/tripulacao/{astronautaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remover astronauta da missão")
    public void removerAstronauta(
            @PathVariable Long id,
            @PathVariable Long astronautaId) {
        missaoService.removerAstronauta(id, astronautaId);
    }

    @PostMapping("/{id}/simular")
    @Operation(summary = "Executar simulação simples da missão")
    public SimulacaoResultadoDTO executarSimulacao(
            @PathVariable Long id,
            @Valid @RequestBody ExecutarSimulacaoRequest request) {
        return missaoService.executarSimulacao(id, request);
    }
}