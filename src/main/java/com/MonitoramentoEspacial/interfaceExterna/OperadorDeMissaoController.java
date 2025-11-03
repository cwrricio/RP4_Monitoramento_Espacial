package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.OperadorDeMissaoServiceInterface;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/operadores")
public class OperadorDeMissaoController {

    @Autowired
    private OperadorDeMissaoServiceInterface operadorService;

    @PostMapping
    public ResponseEntity<OperadorDeMissaoDTO> criar(@Valid @RequestBody CriarOperadorRequest request) {
        OperadorDeMissaoDTO dto = operadorService.criarOperador(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(dto.getId())
                .toUri();
        return ResponseEntity.created(location).body(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperadorDeMissaoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(operadorService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<OperadorDeMissaoDTO>> listar(@RequestParam(required = false) String nome) {
        return ResponseEntity.ok(operadorService.listarOperadores(nome));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        operadorService.deletarOperador(id);
        return ResponseEntity.noContent().build();
    }
}