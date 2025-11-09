package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Espaconave;
import com.MonitoramentoEspacial.interfaceExterna.EspaconaveDTO;
import com.MonitoramentoEspacial.interfaceExterna.SalvarEspaconaveRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper (via MapStruct) para conversão entre Entidades Espaconave e DTOs.
 * componentModel = "spring" torna esta interface um Bean gerenciado pelo Spring.
 */
@Mapper(componentModel = "spring")
public interface EspaconaveMapper {

    /**
     * Converte a Entidade Espaconave no DTO de resposta.
     */
    EspaconaveDTO toDTO(Espaconave espaconave);

    /**
     * Converte o DTO de requisição em uma Entidade.
     * Ignora campos que não devem ser mapeados do DTO.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "missoes", ignore = true)
    Espaconave toEntity(SalvarEspaconaveRequest request);
}