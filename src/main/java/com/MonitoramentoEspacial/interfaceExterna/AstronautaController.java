package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.AstronautaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/astronautas")
public class AstronautaController {

    @Autowired
    private AstronautaService astronautaService;

    @GetMapping("/{id}")
    public ResponseEntity<AstronautaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(astronautaService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<AstronautaDTO>> listarTodos(@RequestParam(required = false) String nome) {
        return ResponseEntity.ok(astronautaService.listarAstronautas(nome));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AstronautaDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AtualizaAstronautaRequest request
    ) {
        return ResponseEntity.ok(astronautaService.atualizarAstronauta(id, request));
    }
}