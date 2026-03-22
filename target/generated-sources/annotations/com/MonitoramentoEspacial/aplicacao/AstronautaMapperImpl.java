package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.interfaceExterna.CriarAstronautaRequest;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-22T17:58:49-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class AstronautaMapperImpl implements AstronautaMapper {

    @Override
    public Astronauta toEntity(CriarAstronautaRequest request) {
        if ( request == null ) {
            return null;
        }

        Astronauta astronauta = new Astronauta();

        astronauta.setNome( request.getNome() );
        if ( request.getIdade() != null ) {
            astronauta.setIdade( request.getIdade() );
        }
        if ( request.getAtivo() != null ) {
            astronauta.setAtivo( request.getAtivo() );
        }
        astronauta.setNivelAptidaoMedica( request.getNivelAptidaoMedica() );
        if ( request.getMissoesRealizadas() != null ) {
            astronauta.setMissoesRealizadas( request.getMissoesRealizadas() );
        }

        return astronauta;
    }
}
