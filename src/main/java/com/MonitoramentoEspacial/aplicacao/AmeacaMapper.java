package com.MonitoramentoEspacial.aplicacao;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.MonitoramentoEspacial.aplicacao.dominio.Ameaca;
import com.MonitoramentoEspacial.interfaceExterna.AmeacaDTO;
import com.MonitoramentoEspacial.interfaceExterna.RegistrarAmeacaRequest;

@Mapper(componentModel = "spring")
public interface AmeacaMapper {

    default AmeacaDTO toDTO(Ameaca ameaca) {
        if (ameaca == null) {
            return null;
        }
        
        Long missaoId = null;
        if (ameaca.getMissao() != null) {
            missaoId = ameaca.getMissao().getId();
        }
        
        return new AmeacaDTO(
            ameaca.getId(),
            missaoId,
            ameaca.getTipo(),
            ameaca.getDescricao(),
            ameaca.getNivelPerigo(),
            ameaca.getDistanciaKm(),
            ameaca.getDetectadaEm()
        );
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "detectadaEm", ignore = true)
    @Mapping(target = "missao", ignore = true) 
    Ameaca toEntity(RegistrarAmeacaRequest request);
}