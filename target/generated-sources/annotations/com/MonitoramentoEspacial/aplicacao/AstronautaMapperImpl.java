package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.interfaceExterna.CriarAstronautaRequest;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-22T14:30:05-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class AstronautaMapperImpl implements AstronautaMapper {

    @Override
    public Astronauta toEntity(CriarAstronautaRequest request) {
        if ( request == null ) {
            return null;
        }

        Astronauta astronauta = new Astronauta();

        if ( request.getAtivo() != null ) {
            astronauta.setAtivo( request.getAtivo() );
        }
        if ( request.getIdade() != null ) {
            astronauta.setIdade( request.getIdade() );
        }
        astronauta.setNome( request.getNome() );
        if ( request.getMissoesRealizadas() != null ) {
            astronauta.setMissoesRealizadas( request.getMissoesRealizadas() );
        }
        astronauta.setNivelAptidaoMedica( request.getNivelAptidaoMedica() );

        return astronauta;
    }
}
