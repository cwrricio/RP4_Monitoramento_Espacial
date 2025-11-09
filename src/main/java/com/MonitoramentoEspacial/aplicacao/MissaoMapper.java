package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.Missao;
import com.MonitoramentoEspacial.aplicacao.dominio.StatusMissao;
import com.MonitoramentoEspacial.interfaceExterna.CriarMissaoRequest;
import com.MonitoramentoEspacial.interfaceExterna.MissaoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper (via MapStruct) para conversão entre Entidades Missao e DTOs.
 * componentModel = "spring" torna esta interface um Bean gerenciado pelo Spring.
 */
@Mapper(componentModel = "spring")
public interface MissaoMapper {

    /**
     * Converte o DTO de criação em uma Entidade.
     * Define o status inicial como PLANEJADA.
     */
    @Mapping(target = "status", expression = "java(com.MonitoramentoEspacial.aplicacao.dominio.StatusMissao.PLANEJADA)")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataFim", ignore = true)
    @Mapping(target = "tripulacao", ignore = true)
    @Mapping(target = "operadorResponsavel", ignore = true)
    @Mapping(target = "espaconave", ignore = true)
    @Mapping(target = "simulacoes", ignore = true)
    @Mapping(target = "protocolos", ignore = true)
    @Mapping(target = "eventos", ignore = true)
    Missao toEntity(CriarMissaoRequest request);

    /**
     * Converte a Entidade Missao em seu DTO de resposta.
     * O MapStruct automaticamente entende que "tripulacao" (List<Astronauta>)
     * deve ser mapeado para "tripulacaoIds" (List<Long>)
     * usando o método auxiliar "astronautaToId" abaixo.
     */
    @Mapping(source = "tripulacao", target = "tripulacaoIds")
    MissaoDTO toDTO(Missao missao);

    /**
     * Método auxiliar para o MapStruct saber como converter List<Astronauta>
     * em List<Long>.
     */
    default Long astronautaToId(Astronauta astronauta) {
        return astronauta.getId();
    }
}