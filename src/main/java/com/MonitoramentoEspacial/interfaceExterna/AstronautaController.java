package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.AstronautaService;
import com.MonitoramentoEspacial.interfaceExterna.AtualizaAstronautaRequest;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;
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
}
