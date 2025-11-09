package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.ProtocoloEmergencial;
import com.MonitoramentoEspacial.interfaceExterna.ProtocoloEmergencialDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProtocoloEmergencialMapper {

    @Mapping(source = "missao.id", target = "missaoId")
    ProtocoloEmergencialDTO toDTO(ProtocoloEmergencial protocolo);
}