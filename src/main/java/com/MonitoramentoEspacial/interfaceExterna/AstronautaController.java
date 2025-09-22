package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.AstronautaService;
import com.MonitoramentoEspacial.interfaceExterna.AtualizaAstronautaRequest;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public ResponseEntity<AstronautaDTO> criar(@RequestBody AtualizaAstronautaRequest request) {
        return ResponseEntity.ok(astronautaService.criarAstronauta(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AstronautaDTO> atualizar(@PathVariable Long id,
                                                   @RequestBody AtualizaAstronautaRequest request) {
        return ResponseEntity.ok(astronautaService.atualizarAstronauta(id, request));
    }
}
