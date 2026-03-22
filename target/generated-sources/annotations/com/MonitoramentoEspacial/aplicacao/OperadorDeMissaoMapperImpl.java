package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.OperadorDeMissao;
import com.MonitoramentoEspacial.interfaceExterna.CriarOperadorRequest;
import com.MonitoramentoEspacial.interfaceExterna.OperadorDeMissaoDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-22T17:58:51-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class OperadorDeMissaoMapperImpl implements OperadorDeMissaoMapper {

    @Override
    public OperadorDeMissaoDTO toDTO(OperadorDeMissao operador) {
        if ( operador == null ) {
            return null;
        }

        Long id = null;
        String nome = null;
        int idade = 0;
        boolean ativo = false;
        String turno = null;
        String areaEspecializacao = null;

        id = operador.getId();
        nome = operador.getNome();
        idade = operador.getIdade();
        ativo = operador.isAtivo();
        turno = operador.getTurno();
        areaEspecializacao = operador.getAreaEspecializacao();

        OperadorDeMissaoDTO operadorDeMissaoDTO = new OperadorDeMissaoDTO( id, nome, idade, ativo, turno, areaEspecializacao );

        return operadorDeMissaoDTO;
    }

    @Override
    public OperadorDeMissao toEntity(CriarOperadorRequest request) {
        if ( request == null ) {
            return null;
        }

        OperadorDeMissao operadorDeMissao = new OperadorDeMissao();

        operadorDeMissao.setNome( request.getNome() );
        if ( request.getIdade() != null ) {
            operadorDeMissao.setIdade( request.getIdade() );
        }
        if ( request.getAtivo() != null ) {
            operadorDeMissao.setAtivo( request.getAtivo() );
        }
        operadorDeMissao.setTurno( request.getTurno() );
        operadorDeMissao.setAreaEspecializacao( request.getAreaEspecializacao() );

        return operadorDeMissao;
    }
}
