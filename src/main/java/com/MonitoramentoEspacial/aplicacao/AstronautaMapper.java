package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.DadosBiometricos;
import com.MonitoramentoEspacial.interfaceExterna.AtualizaAstronautaRequest;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;

public class AstronautaMapper {

    public static AstronautaDTO toDTO(Astronauta astronauta) {
        DadosBiometricos biometria = astronauta.getDadosBiometricos();

        String tipo = null;
        String valor = null;
        String unidade = null;
        java.time.LocalDateTime registradoEm = null;

        if (biometria != null) {
            tipo = biometria.getTipo();
            valor = biometria.getValor();
            unidade = biometria.getUnidade();
            registradoEm = biometria.getRegistradoEm();
        }

        return new AstronautaDTO(
                astronauta.getId(),
                astronauta.getNome(),
                astronauta.getIdade(),
                astronauta.isAtivo(),
                astronauta.getNivelAptidaoMedica(),
                astronauta.getMissoesRealizadas(),
                tipo,
                valor,
                unidade,
                registradoEm
        );
    }

    public static Astronauta fromRequest(AtualizaAstronautaRequest request) {
        Astronauta astronauta = new Astronauta();
        astronauta.setNome(request.getNome());
        astronauta.setNivelAptidaoMedica(request.getNivelAptidaoMedica());
        return astronauta;
    }
}
