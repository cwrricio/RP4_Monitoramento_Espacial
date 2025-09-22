package com.example.demo.api;

import com.example.demo.api.dto.*;
import com.example.demo.application.AstronautaService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/astronautas")
public class AstronautaController {

    private final AstronautaService service;
    public AstronautaController(AstronautaService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AstronautaDTO criar(@RequestBody NovoAstronautaRequest req){
        return service.criar(req);
    }

    @GetMapping
    public List<AstronautaDTO> listar(){ return service.listar(); }

    @GetMapping("/{id}")
    public AstronautaDTO obter(@PathVariable Long id){ return service.obter(id); }

    @PutMapping("/{id}")
    public AstronautaDTO atualizar(@PathVariable Long id, @RequestBody AtualizaAstronautaRequest req){
        return service.atualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id){ service.remover(id); }
}
