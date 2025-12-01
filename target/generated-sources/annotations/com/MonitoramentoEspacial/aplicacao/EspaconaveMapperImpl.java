package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Espaconave;
import com.MonitoramentoEspacial.interfaceExterna.EspaconaveDTO;
import com.MonitoramentoEspacial.interfaceExterna.SalvarEspaconaveRequest;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-30T10:21:57-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class EspaconaveMapperImpl implements EspaconaveMapper {

    @Override
    public EspaconaveDTO toDTO(Espaconave espaconave) {
        if ( espaconave == null ) {
            return null;
        }

        EspaconaveDTO espaconaveDTO = new EspaconaveDTO();

        espaconaveDTO.setCapacidade( espaconave.getCapacidadeTripulacao() );
        espaconaveDTO.setId( espaconave.getId() );
        espaconaveDTO.setNome( espaconave.getNome() );
        espaconaveDTO.setStatusOperacional( espaconave.getStatusOperacional() );

        return espaconaveDTO;
    }

    @Override
    public Espaconave toEntity(SalvarEspaconaveRequest request) {
        if ( request == null ) {
            return null;
        }

        Espaconave espaconave = new Espaconave();

        if ( request.getCapacidade() != null ) {
            espaconave.setCapacidadeTripulacao( request.getCapacidade() );
        }
        espaconave.setNome( request.getNome() );
        espaconave.setStatusOperacional( request.getStatusOperacional() );

        return espaconave;
    }
}
