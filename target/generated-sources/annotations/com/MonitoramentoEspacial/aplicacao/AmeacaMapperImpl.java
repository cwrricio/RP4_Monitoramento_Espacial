package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Ameaca;
import com.MonitoramentoEspacial.aplicacao.dominio.Missao;
import com.MonitoramentoEspacial.aplicacao.dominio.TipoAmeaca;
import com.MonitoramentoEspacial.interfaceExterna.AmeacaDTO;
import com.MonitoramentoEspacial.interfaceExterna.RegistrarAmeacaRequest;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-22T17:58:54-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class AmeacaMapperImpl implements AmeacaMapper {

    @Override
    public AmeacaDTO toDTO(Ameaca ameaca) {
        if ( ameaca == null ) {
            return null;
        }

        Long missaoId = null;
        Long id = null;
        TipoAmeaca tipo = null;
        String descricao = null;
        int nivelPerigo = 0;
        double distanciaKm = 0.0d;
        LocalDateTime detectadaEm = null;

        missaoId = ameacaMissaoId( ameaca );
        id = ameaca.getId();
        tipo = ameaca.getTipo();
        descricao = ameaca.getDescricao();
        nivelPerigo = ameaca.getNivelPerigo();
        distanciaKm = ameaca.getDistanciaKm();
        detectadaEm = ameaca.getDetectadaEm();

        AmeacaDTO ameacaDTO = new AmeacaDTO( id, missaoId, tipo, descricao, nivelPerigo, distanciaKm, detectadaEm );

        return ameacaDTO;
    }

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

    private Long ameacaMissaoId(Ameaca ameaca) {
        if ( ameaca == null ) {
            return null;
        }
        Missao missao = ameaca.getMissao();
        if ( missao == null ) {
            return null;
        }
        Long id = missao.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
