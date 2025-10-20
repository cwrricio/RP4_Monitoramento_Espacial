package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.DadosBiometricos;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Optional;

public class AstronautaMapper {

    public static AstronautaDTO toDTO(Astronauta astronauta) {

        // Boa prática: inicializar com valores padrão para evitar NullPointerException no DTO
        String tipo = null;
        String valor = null;
        String unidade = null;
        java.time.LocalDateTime registradoEm = null;

        Optional<DadosBiometricos> ultimoDado = astronauta.getDadosBiometricos().stream()
                .max(Comparator.comparing(DadosBiometricos::getRegistradoEm));

        if (ultimoDado.isPresent()) {
            DadosBiometricos biometria = ultimoDado.get();
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