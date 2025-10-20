package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.MissaoServiceInterface; // MUDANÇA AQUI
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/missoes")
public class MissaoController {

    @Autowired
    private MissaoServiceInterface missaoService; // MUDANÇA AQUI

    @PostMapping
    public ResponseEntity<MissaoDTO> criar(@Valid @RequestBody CriarMissaoRequest request) {
        MissaoDTO missaoCriada = missaoService.criarMissao(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(missaoCriada.getId())
                .toUri();

        return ResponseEntity.created(location).body(missaoCriada);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MissaoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(missaoService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<MissaoDTO>> listarTodas() {
        return ResponseEntity.ok(missaoService.listarTodas());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        missaoService.deletarMissao(id);
        return ResponseEntity.noContent().build(); // Resposta 204 No Content (sucesso)
    }

    @PostMapping("/{id}/iniciar-simulacao")
    public ResponseEntity<MissaoDTO> iniciarSimulacao(@PathVariable Long id) {
        MissaoDTO missaoAtualizada = missaoService.iniciarSimulacao(id);
        return ResponseEntity.ok(missaoAtualizada);
    }
}