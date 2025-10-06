package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.MissaoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/missoes")
public class MissaoController {
    private final MissaoService missaoService;

    public MissaoController(MissaoService missaoService) {
        this.missaoService = missaoService;
    }

    @PostMapping
    public ResponseEntity<MissaoDTO> criar(@Valid @RequestBody CriarMissaoRequest request) {
        MissaoDTO novaMissao = missaoService.criarMissao(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(novaMissao.getId())
                .toUri();
        return ResponseEntity.created(location).body(novaMissao);
    }

    @GetMapping
    public ResponseEntity<List<MissaoDTO>> listar() {
        return ResponseEntity.ok(missaoService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MissaoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(missaoService.buscarPorId(id));
    }

    @PostMapping("/{id}/iniciar-simulacao")
    public ResponseEntity<MissaoDTO> iniciarSimulacao(@PathVariable Long id) {
        MissaoDTO missaoAtualizada = missaoService.iniciarSimulacao(id);
        return ResponseEntity.ok(missaoAtualizada);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        missaoService.deletarMissao(id);
        return ResponseEntity.noContent().build();
    }
}
