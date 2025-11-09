package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Evento;
import com.MonitoramentoEspacial.interfaceExterna.EventoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EventoMapper {

    @Mapping(source = "missao.id", target = "missaoId")
    EventoDTO toDTO(Evento evento);
}