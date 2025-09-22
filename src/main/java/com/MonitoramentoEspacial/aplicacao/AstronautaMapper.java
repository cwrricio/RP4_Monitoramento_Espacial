package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.interfaceExterna.AtualizaAstronautaRequest;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;

public class AstronautaMapper {

    public static AstronautaDTO toDTO(Astronauta astronauta) {
        String biometria = astronauta.getDadosBiometricos() != null
                ? astronauta.getDadosBiometricos().getValor()
                : "N/A";
        return new AstronautaDTO(
                astronauta.getId(),
                astronauta.getNome(),
                astronauta.getNivelAptidaoMedica(),
                biometria
        );
    }

    public static Astronauta fromRequest(AtualizaAstronautaRequest request) {
        Astronauta astronauta = new Astronauta();
        astronauta.atualizarDados(request.getNome(), request.getNivelAptidaoMedica());
        return astronauta;
    }
}
