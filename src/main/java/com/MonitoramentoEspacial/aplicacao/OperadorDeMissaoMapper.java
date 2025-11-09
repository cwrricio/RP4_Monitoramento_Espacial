package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.OperadorDeMissao;
import com.MonitoramentoEspacial.interfaceExterna.CriarOperadorRequest;
import com.MonitoramentoEspacial.interfaceExterna.OperadorDeMissaoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper (via MapStruct) para conversão entre Entidades OperadorDeMissao e DTOs.
 */
@Mapper(componentModel = "spring")
public interface OperadorDeMissaoMapper {

    /**
     * Converte a Entidade OperadorDeMissao no DTO de resposta.
     */
    OperadorDeMissaoDTO toDTO(OperadorDeMissao operador);

    /**
     * Converte o DTO de requisição em uma Entidade.
     */
    @Mapping(target = "id", ignore = true)
    OperadorDeMissao toEntity(CriarOperadorRequest request);
}