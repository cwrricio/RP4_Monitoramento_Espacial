package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.AstronautaServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder; // <- IMPORTAR

import jakarta.validation.Valid;
import java.net.URI; // <- IMPORTAR
import java.util.List;

@RestController
@RequestMapping("/astronautas")
public class AstronautaController {
    @Autowired
    private AstronautaServiceInterface astronautaService;

    /**
     * NOVO ENDPOINT
     * Cria um novo astronauta.
     * @param request Dados do astronauta.
     * @return Resposta 201 Created com a localização do novo recurso.
     */
    @PostMapping
    public ResponseEntity<AstronautaDTO> criar(@Valid @RequestBody CriarAstronautaRequest request) {
        AstronautaDTO astronautaCriado = astronautaService.criarAstronauta(request);

        // Gera a URI para o novo recurso (Ex: /astronautas/5)
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(astronautaCriado.getId())
                .toUri();

        // Retorna o status 201 Created
        return ResponseEntity.created(location).body(astronautaCriado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AstronautaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(astronautaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<AstronautaDTO> criar(
            @Valid @RequestBody AtualizaAstronautaRequest request
    ) {
        AstronautaDTO novoAstronauta = astronautaService.criarAstronauta(request); 
        return ResponseEntity.status(HttpStatus.CREATED).body(novoAstronauta);
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