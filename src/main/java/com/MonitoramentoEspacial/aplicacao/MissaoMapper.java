package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Missao;
import com.MonitoramentoEspacial.aplicacao.dominio.StatusMissao;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;
import com.MonitoramentoEspacial.interfaceExterna.CriarMissaoRequest;
import com.MonitoramentoEspacial.interfaceExterna.MissaoDTO;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class MissaoMapper {

    private final AstronautaMapper astronautaMapper;

    public MissaoMapper(AstronautaMapper astronautaMapper) {
        this.astronautaMapper = astronautaMapper;
    }

    public MissaoDTO toDTO(Missao missao) {
        if (missao == null) return null;

        List<AstronautaDTO> tripulacaoDTOs = Collections.emptyList();

        if (missao.getTripulacao() != null && !missao.getTripulacao().isEmpty()) {
            tripulacaoDTOs = missao.getTripulacao().stream()
                    .map(astronautaMapper::toDTO)
                    .collect(Collectors.toList());
        }

        return new MissaoDTO(
                missao.getId(),
                missao.getNome(),
                missao.getObjetivo(),
                missao.getDataInicio(),
                missao.getDataFim(),
                missao.getStatus(),
                tripulacaoDTOs
        );
    }

    public Missao toEntity(CriarMissaoRequest request) {
        if (request == null) return null;
        Missao missao = new Missao();
        missao.setNome(request.getNome());
        missao.setObjetivo(request.getObjetivo());
        missao.setDataInicio(request.getDataInicio());
        missao.setStatus(StatusMissao.PLANEJADA);
        return missao;
    }
}