package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.Missao;
import com.MonitoramentoEspacial.aplicacao.dominio.StatusMissao;
import com.MonitoramentoEspacial.interfaceExterna.CriarMissaoRequest;
import com.MonitoramentoEspacial.interfaceExterna.MissaoDTO;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper Manual para Missao.
 * Substitui a interface MapStruct para evitar erros de mapeamento de coleções complexas.
 */
@Component
public class MissaoMapper {

    /**
     * Converte Entidade -> DTO
     */
    public MissaoDTO toDTO(Missao missao) {
        if (missao == null) {
            return null;
        }

        // Lógica manual segura para converter List<Astronauta> -> List<Long>
        List<Long> tripulacaoIds = Collections.emptyList();
        
        // Verifica se a lista existe e não está vazia antes de fazer o stream
        if (missao.getTripulacao() != null && !missao.getTripulacao().isEmpty()) {
            tripulacaoIds = missao.getTripulacao().stream()
                    .map(Astronauta::getId)
                    .collect(Collectors.toList());
        }

        return new MissaoDTO(
                missao.getId(),
                missao.getNome(),
                missao.getObjetivo(),
                missao.getDataInicio(),
                missao.getDataFim(),
                missao.getStatus(),
                tripulacaoIds
        );
    }

    /**
     * Converte Request -> Entidade
     */
    public Missao toEntity(CriarMissaoRequest request) {
        if (request == null) {
            return null;
        }

        Missao missao = new Missao();
        missao.setNome(request.getNome());
        missao.setObjetivo(request.getObjetivo());
        missao.setDataInicio(request.getDataInicio());
        
        // Define o status inicial padrão
        missao.setStatus(StatusMissao.PLANEJADA);

        // Nota: tripulacao, eventos, protocolos, simulacoes e espaconave
        // são inicializados vazios ou nulos e preenchidos posteriormente pelo serviço.
        
        return missao;
    }
}