package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Espaconave;
import com.MonitoramentoEspacial.interfaceExterna.EspaconaveDTO;
import com.MonitoramentoEspacial.interfaceExterna.SalvarEspaconaveRequest;

public class EspaconaveMapper {
    
    public static EspaconaveDTO toDTO(Espaconave espaconave) {
        return new EspaconaveDTO(
            espaconave.getId(),
            espaconave.getNome(),
            espaconave.getCapacidadeTripulacao(),
            espaconave.getStatusOperacional()
        );
    }

    public static Espaconave fromRequest(SalvarEspaconaveRequest request) {
        Espaconave espaconave = new Espaconave();
        espaconave.setNome(request.getNome());
        espaconave.setCapacidadeTripulacao(request.getCapacidadeTripulacao());
        espaconave.setStatusOperacional(request.getStatusOperacional());
        return espaconave;
    }
}