package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.AstronautaServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI; 
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

    // ===================================================================
    // NOVO ENDPOINT ADICIONADO
    // ===================================================================
    /**
     * Deleta um astronauta com base no ID.
     * @param id O ID do astronauta a ser deletado.
     * @return Resposta 204 No Content (sucesso sem corpo).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        astronautaService.deletarAstronauta(id);
        
        // A resposta padrão para um DELETE bem-sucedido é 204 No Content
        return ResponseEntity.noContent().build();
    }
}