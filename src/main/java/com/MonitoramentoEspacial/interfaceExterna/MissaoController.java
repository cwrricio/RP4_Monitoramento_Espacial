package com.MonitoramentoEspacial.interfaceExterna;

import com.MonitoramentoEspacial.aplicacao.MissaoServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/missoes") 
public class MissaoController {

    @Autowired
    private MissaoServiceInterface missaoService; 

    @PostMapping
    public ResponseEntity<MissaoDTO> criar(@Valid @RequestBody CriarMissaoRequest request) {
        MissaoDTO missaoCriada = missaoService.criarMissao(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(missaoCriada.getId())
                .toUri();
        return ResponseEntity.created(location).body(missaoCriada);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MissaoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(missaoService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<MissaoDTO>> listarTodas() {
        return ResponseEntity.ok(missaoService.listarTodas());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        missaoService.deletarMissao(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/iniciar-simulacao")
    public ResponseEntity<MissaoDTO> iniciarSimulacao(@PathVariable Long id) {
        MissaoDTO missaoAtualizada = missaoService.iniciarSimulacao(id);
        return ResponseEntity.ok(missaoAtualizada);
    }

    // --- NOVOS ENDPOINTS PARA O PAINEL DE CONTROLE ---

    /**
     * Endpoint para listar todos os eventos de uma missão.
     * Corresponde a: GET /api/missoes/{id}/eventos
     */
    @GetMapping("/{id}/eventos")
    public ResponseEntity<List<EventoDTO>> listarEventos(@PathVariable Long id) {
        List<EventoDTO> eventos = missaoService.listarEventosPorMissao(id);
        return ResponseEntity.ok(eventos);
    }

    /**
     * Endpoint para listar todos os protocolos acionados em uma missão.
     * Corresponde a: GET /api/missoes/{id}/protocolos
     */
    @GetMapping("/{id}/protocolos")
    public ResponseEntity<List<ProtocoloEmergencialDTO>> listarProtocolos(@PathVariable Long id) {
        List<ProtocoloEmergencialDTO> protocolos = missaoService.listarProtocolosPorMissao(id);
        return ResponseEntity.ok(protocolos);
    }

    /**
     * Endpoint para acionar um novo protocolo de emergência.
     * Corresponde a: POST /api/missoes/{id}/protocolos
     */
    @PostMapping("/{id}/protocolos")
    public ResponseEntity<ProtocoloEmergencialDTO> acionarProtocolo(
            @PathVariable Long id, 
            @Valid @RequestBody AcionarProtocoloRequest request) {
        
        ProtocoloEmergencialDTO protocoloAcionado = missaoService.acionarProtocolo(id, request);
        // Retorna 201 Created
        return ResponseEntity.status(201).body(protocoloAcionado);
    }

    /**
     * Endpoint para marcar uma missão como CONCLUIDA.
     * Corresponde a: POST /api/missoes/{id}/concluir
     */
    @PostMapping("/{id}/concluir")
    public ResponseEntity<MissaoDTO> concluirMissao(@PathVariable Long id) {
        MissaoDTO missaoConcluida = missaoService.concluirMissao(id);
        return ResponseEntity.ok(missaoConcluida);
    }
}