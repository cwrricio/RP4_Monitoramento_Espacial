package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Evento;
import com.MonitoramentoEspacial.aplicacao.dominio.Missao;
import com.MonitoramentoEspacial.aplicacao.dominio.TipoEvento;
import com.MonitoramentoEspacial.interfaceExterna.EventoDTO;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-22T17:58:53-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class EventoMapperImpl implements EventoMapper {

    @Override
    public EventoDTO toDTO(Evento evento) {
        if ( evento == null ) {
            return null;
        }

        Long missaoId = null;
        Long id = null;
        LocalDateTime timestamp = null;
        TipoEvento tipo = null;
        String descricao = null;

        missaoId = eventoMissaoId( evento );
        id = evento.getId();
        timestamp = evento.getTimestamp();
        tipo = evento.getTipo();
        descricao = evento.getDescricao();

        EventoDTO eventoDTO = new EventoDTO( id, missaoId, timestamp, tipo, descricao );

        return eventoDTO;
    }

    private Long eventoMissaoId(Evento evento) {
        if ( evento == null ) {
            return null;
        }
        Missao missao = evento.getMissao();
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
