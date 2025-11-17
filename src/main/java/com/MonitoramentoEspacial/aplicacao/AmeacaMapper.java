package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Ameaca;
import com.MonitoramentoEspacial.interfaceExterna.AmeacaDTO;
import com.MonitoramentoEspacial.interfaceExterna.RegistrarAmeacaRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AmeacaMapper {

    @Mapping(source = "missao.id", target = "missaoId")
    AmeacaDTO toDTO(Ameaca ameaca);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "detectadaEm", ignore = true)
    @Mapping(target = "missao", ignore = true) 
    Ameaca toEntity(RegistrarAmeacaRequest request);
}