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
    public ResponseEntity<?> criar(@RequestBody CriarMissaoRequest request) {
        try {
            MissaoDTO missaoCriada = missaoService.criarMissao(request);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                    .buildAndExpand(missaoCriada.getId()).toUri();
            return ResponseEntity.created(location).body(missaoCriada);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("ERRO NO JAVA: " + e.getMessage());
        }
    }

    // NOVO ENDPOINT DE ATUALIZAÇÃO
    @PutMapping("/{id}")
    public ResponseEntity<MissaoDTO> atualizar(@PathVariable Long id, @RequestBody AtualizarMissaoRequest request) {
        return ResponseEntity.ok(missaoService.atualizarMissao(id, request));
    }

    @GetMapping
    public ResponseEntity<?> listarTodas() {
        try {
            return ResponseEntity.ok(missaoService.listarTodas());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("ERRO NO GET: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<MissaoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(missaoService.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        missaoService.deletarMissao(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/iniciar-simulacao")
    public ResponseEntity<MissaoDTO> iniciarSimulacao(@PathVariable Long id) {
        return ResponseEntity.ok(missaoService.iniciarSimulacao(id));
    }

    @GetMapping("/{id}/eventos")
    public ResponseEntity<List<EventoDTO>> listarEventos(@PathVariable Long id) {
        return ResponseEntity.ok(missaoService.listarEventosPorMissao(id));
    }

    @GetMapping("/{id}/protocolos")
    public ResponseEntity<List<ProtocoloEmergencialDTO>> listarProtocolos(@PathVariable Long id) {
        return ResponseEntity.ok(missaoService.listarProtocolosPorMissao(id));
    }

    @PostMapping("/{id}/protocolos")
    public ResponseEntity<ProtocoloEmergencialDTO> acionarProtocolo(@PathVariable Long id, @Valid @RequestBody AcionarProtocoloRequest request) {
        return ResponseEntity.status(201).body(missaoService.acionarProtocolo(id, request));
    }

    @PostMapping("/{id}/concluir")
    public ResponseEntity<MissaoDTO> concluirMissao(@PathVariable Long id) {
        return ResponseEntity.ok(missaoService.concluirMissao(id));
    }
}