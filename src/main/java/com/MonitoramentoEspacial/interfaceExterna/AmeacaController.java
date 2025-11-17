package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.AmeacaServiceInterface;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/ameacas")
public class AmeacaController {

    @Autowired
    private AmeacaServiceInterface ameacaService;

    @PostMapping
    public ResponseEntity<AmeacaDTO> registrar(@Valid @RequestBody RegistrarAmeacaRequest request) {
        AmeacaDTO dto = ameacaService.registrarAmeaca(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(dto.id())
                .toUri();
        return ResponseEntity.created(location).body(dto);
    }

    @GetMapping("/missao/{missaoId}")
    public ResponseEntity<List<AmeacaDTO>> listarPorMissao(@PathVariable Long missaoId) {
        return ResponseEntity.ok(ameacaService.listarPorMissao(missaoId));
    }

    @GetMapping("/criticas")
    public ResponseEntity<List<AmeacaDTO>> listarCriticas() {
        return ResponseEntity.ok(ameacaService.listarAmeacasCriticas());
    }
}