package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.interfaceExterna.CriarAstronautaRequest;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-24T17:09:51-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 24.0.2 (Oracle Corporation)"
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
