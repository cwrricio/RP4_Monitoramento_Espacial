package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Espaconave;
import com.MonitoramentoEspacial.interfaceExterna.EspaconaveDTO;
import com.MonitoramentoEspacial.interfaceExterna.SalvarEspaconaveRequest;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T04:53:04-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class EspaconaveMapperImpl implements EspaconaveMapper {

    @Override
    public EspaconaveDTO toDTO(Espaconave espaconave) {
        if ( espaconave == null ) {
            return null;
        }

        Long id = null;
        String nome = null;
        int capacidadeTripulacao = 0;
        String statusOperacional = null;

        id = espaconave.getId();
        nome = espaconave.getNome();
        capacidadeTripulacao = espaconave.getCapacidadeTripulacao();
        statusOperacional = espaconave.getStatusOperacional();

        EspaconaveDTO espaconaveDTO = new EspaconaveDTO( id, nome, capacidadeTripulacao, statusOperacional );

        return espaconaveDTO;
    }

    @Override
    public Espaconave toEntity(SalvarEspaconaveRequest request) {
        if ( request == null ) {
            return null;
        }

        Espaconave espaconave = new Espaconave();

        espaconave.setNome( request.getNome() );
        espaconave.setStatusOperacional( request.getStatusOperacional() );

        return espaconave;
    }
}
