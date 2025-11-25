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

    /**
     * ENDPOINT DE CRIAÇÃO (COM DEBUG)
     * Envolvi em try-catch para que, se der erro 500, o motivo apareça na sua tela.
     */
    @PostMapping
    public ResponseEntity<?> criar(@RequestBody CriarMissaoRequest request) {
        try {
            // Logs para vermos no terminal se os dados chegaram
            System.out.println("=== DEBUG: Recebendo POST /missoes ===");
            System.out.println("Nome: " + request.getNome());
            System.out.println("Data: " + request.getDataInicio());

            MissaoDTO missaoCriada = missaoService.criarMissao(request);
            
            URI location = ServletUriComponentsBuilder
                    .fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(missaoCriada.getId())
                    .toUri();
            
            return ResponseEntity.created(location).body(missaoCriada);

        } catch (Exception e) {
            // Se der erro, imprime no terminal e MANDA PARA O FRONT
            e.printStackTrace();
            String erro = "ERRO NO JAVA (" + e.getClass().getSimpleName() + "): " + e.getMessage();
            if (e.getCause() != null) {
                erro += " | CAUSA RAIZ: " + e.getCause().getMessage();
            }
            return ResponseEntity.status(500).body(erro);
        }
    }

    /**
     * ENDPOINT DE LISTAGEM (COM DEBUG)
     * Também protegido para vermos se o erro é de banco de dados sujo.
     */
    @GetMapping
    public ResponseEntity<?> listarTodas() {
        try {
            List<MissaoDTO> lista = missaoService.listarTodas();
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
            String erro = "ERRO NO GET (" + e.getClass().getSimpleName() + "): " + e.getMessage();
            return ResponseEntity.status(500).body(erro);
        }
    }

    // --- MÉTODOS PADRÃO (Mantidos) ---

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
        MissaoDTO missaoAtualizada = missaoService.iniciarSimulacao(id);
        return ResponseEntity.ok(missaoAtualizada);
    }

    // --- ENDPOINTS ESPECÍFICOS DO PAINEL (Mantidos) ---

    /**
     * Lista eventos de uma missão específica
     */
    @GetMapping("/{id}/eventos")
    public ResponseEntity<List<EventoDTO>> listarEventos(@PathVariable Long id) {
        return ResponseEntity.ok(missaoService.listarEventosPorMissao(id));
    }

    /**
     * Lista protocolos de uma missão específica
     */
    @GetMapping("/{id}/protocolos")
    public ResponseEntity<List<ProtocoloEmergencialDTO>> listarProtocolos(@PathVariable Long id) {
        return ResponseEntity.ok(missaoService.listarProtocolosPorMissao(id));
    }

    /**
     * Aciona um protocolo de emergência
     */
    @PostMapping("/{id}/protocolos")
    public ResponseEntity<ProtocoloEmergencialDTO> acionarProtocolo(
            @PathVariable Long id, 
            @Valid @RequestBody AcionarProtocoloRequest request) {
        
        ProtocoloEmergencialDTO protocoloAcionado = missaoService.acionarProtocolo(id, request);
        return ResponseEntity.status(201).body(protocoloAcionado);
    }

    /**
     * Conclui uma missão
     */
    @PostMapping("/{id}/concluir")
    public ResponseEntity<MissaoDTO> concluirMissao(@PathVariable Long id) {
        MissaoDTO missaoConcluida = missaoService.concluirMissao(id);
        return ResponseEntity.ok(missaoConcluida);
    }
}