package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Missao;
import com.MonitoramentoEspacial.aplicacao.dominio.ProtocoloEmergencial;
import com.MonitoramentoEspacial.aplicacao.dominio.TipoProtocolo;
import com.MonitoramentoEspacial.interfaceExterna.ProtocoloEmergencialDTO;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-22T17:58:53-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ProtocoloEmergencialMapperImpl implements ProtocoloEmergencialMapper {

    @Override
    public ProtocoloEmergencialDTO toDTO(ProtocoloEmergencial protocolo) {
        if ( protocolo == null ) {
            return null;
        }

        Long missaoId = null;
        Long id = null;
        TipoProtocolo tipo = null;
        String descricao = null;
        LocalDateTime acionadoEm = null;

        missaoId = protocoloMissaoId( protocolo );
        id = protocolo.getId();
        tipo = protocolo.getTipo();
        descricao = protocolo.getDescricao();
        acionadoEm = protocolo.getAcionadoEm();

        ProtocoloEmergencialDTO protocoloEmergencialDTO = new ProtocoloEmergencialDTO( id, missaoId, tipo, descricao, acionadoEm );

        return protocoloEmergencialDTO;
    }

    private Long protocoloMissaoId(ProtocoloEmergencial protocoloEmergencial) {
        if ( protocoloEmergencial == null ) {
            return null;
        }
        Missao missao = protocoloEmergencial.getMissao();
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
