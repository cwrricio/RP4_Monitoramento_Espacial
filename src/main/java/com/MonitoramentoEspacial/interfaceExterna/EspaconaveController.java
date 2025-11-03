package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.EspaconaveServiceInterface;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/espaconaves")
public class EspaconaveController {

    @Autowired
    private EspaconaveServiceInterface espaconaveService;

    @PostMapping
    public ResponseEntity<EspaconaveDTO> criar(@Valid @RequestBody SalvarEspaconaveRequest request) {
        EspaconaveDTO dto = espaconaveService.criarEspaconave(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(dto.getId())
                .toUri();
        return ResponseEntity.created(location).body(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EspaconaveDTO> atualizar(@PathVariable Long id, @Valid @RequestBody SalvarEspaconaveRequest request) {
        EspaconaveDTO dto = espaconaveService.atualizarEspaconave(id, request);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EspaconaveDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(espaconaveService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<EspaconaveDTO>> listar(@RequestParam(required = false) String nome) {
        return ResponseEntity.ok(espaconaveService.listarEspaconaves(nome));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        espaconaveService.deletarEspaconave(id);
        return ResponseEntity.noContent().build();
    }
}