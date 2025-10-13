package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.DadosBiometricos;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;

public class AstronautaMapper {

    public static AstronautaDTO toDTO(Astronauta astronauta) {
        DadosBiometricos biometria = astronauta.getDadosBiometricos();

        // Boa prática: inicializar com valores padrão para evitar NullPointerException no DTO
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

}