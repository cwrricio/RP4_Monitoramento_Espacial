package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.Missao;
import com.MonitoramentoEspacial.aplicacao.dominio.StatusMissao;
import com.MonitoramentoEspacial.interfaceExterna.CriarMissaoRequest;
import com.MonitoramentoEspacial.interfaceExterna.MissaoDTO;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-17T14:49:56-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class MissaoMapperImpl implements MissaoMapper {

    @Override
    public Missao toEntity(CriarMissaoRequest request) {
        if ( request == null ) {
            return null;
        }

        Missao missao = new Missao();

        missao.setNome( request.getNome() );
        missao.setObjetivo( request.getObjetivo() );
        missao.setDataInicio( request.getDataInicio() );

        missao.setStatus( com.MonitoramentoEspacial.aplicacao.dominio.StatusMissao.PLANEJADA );

        return missao;
    }

    @Override
    public MissaoDTO toDTO(Missao missao) {
        if ( missao == null ) {
            return null;
        }

        List<Long> tripulacaoIds = null;
        Long id = null;
        String nome = null;
        String objetivo = null;
        LocalDate dataInicio = null;
        LocalDate dataFim = null;
        StatusMissao status = null;

        tripulacaoIds = astronautaListToLongList( missao.getTripulacao() );
        id = missao.getId();
        nome = missao.getNome();
        objetivo = missao.getObjetivo();
        dataInicio = missao.getDataInicio();
        dataFim = missao.getDataFim();
        status = missao.getStatus();

        MissaoDTO missaoDTO = new MissaoDTO( id, nome, objetivo, dataInicio, dataFim, status, tripulacaoIds );

        return missaoDTO;
    }

    protected List<Long> astronautaListToLongList(List<Astronauta> list) {
        if ( list == null ) {
            return null;
        }

        List<Long> list1 = new ArrayList<Long>( list.size() );
        for ( Astronauta astronauta : list ) {
            list1.add( astronautaToId( astronauta ) );
        }

        return list1;
    }
}
