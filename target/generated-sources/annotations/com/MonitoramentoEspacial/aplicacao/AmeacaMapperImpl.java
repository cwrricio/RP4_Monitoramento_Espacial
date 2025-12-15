package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Ameaca;
import com.MonitoramentoEspacial.interfaceExterna.RegistrarAmeacaRequest;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-15T18:28:36-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class AmeacaMapperImpl implements AmeacaMapper {

    @Override
    public Ameaca toEntity(RegistrarAmeacaRequest request) {
        if ( request == null ) {
            return null;
        }

        Ameaca ameaca = new Ameaca();

        ameaca.setTipo( request.tipo() );
        ameaca.setDescricao( request.descricao() );
        ameaca.setNivelPerigo( request.nivelPerigo() );
        ameaca.setDistanciaKm( request.distanciaKm() );

        return ameaca;
    }
}
