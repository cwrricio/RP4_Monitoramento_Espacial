package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.AstronautaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/astronautas")
public class AstronautaController {

    private final AstronautaService astronautaService;

    public AstronautaController(AstronautaService astronautaService) {
        this.astronautaService = astronautaService;
    }

    @GetMapping
    public ResponseEntity<List<AstronautaDTO>> listar() {
        return ResponseEntity.ok(astronautaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AstronautaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(astronautaService.buscarPorId(id));
    }

    @GetMapping("/buscar/nome/{nome}")
    public ResponseEntity<List<AstronautaDTO>> buscarPorNome(@PathVariable String nome) {
        return ResponseEntity.ok(astronautaService.buscarPorNome(nome));
    }

    @GetMapping("/buscar/nivel/{nivel}")
    public ResponseEntity<List<AstronautaDTO>> buscarPorNivel(@PathVariable String nivel) {
        return ResponseEntity.ok(astronautaService.buscarPorNivelAptidao(nivel));
    }

    @PostMapping
    public ResponseEntity<AstronautaDTO> criar(@Valid @RequestBody AtualizaAstronautaRequest request) {
        AstronautaDTO dto = astronautaService.criarAstronauta(request);
        return ResponseEntity.created(URI.create("/astronautas/" + dto.getId())).body(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AstronautaDTO> atualizar(@PathVariable Long id,
                                                   @Valid @RequestBody AtualizaAstronautaRequest request) {
        return ResponseEntity.ok(astronautaService.atualizarAstronauta(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        astronautaService.deletarAstronauta(id);
        return ResponseEntity.noContent().build();
    }
}
