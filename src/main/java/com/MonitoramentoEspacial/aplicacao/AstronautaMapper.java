package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import com.MonitoramentoEspacial.aplicacao.dominio.DadosBiometricos;
import com.MonitoramentoEspacial.interfaceExterna.AstronautaDTO;
import com.MonitoramentoEspacial.interfaceExterna.CriarAstronautaRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping; 
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Optional;

/**
 * Mapper (via MapStruct) para conversão entre Entidades Astronauta e DTOs.
 * componentModel = "spring" torna esta interface um Bean gerenciado pelo Spring.
 */
@Mapper(componentModel = "spring")
public interface AstronautaMapper {

    /**
     * Converte o DTO de criação em uma Entidade.
     * O MapStruct implementa este método automaticamente.
     * 2. ANOTAÇÕES ADICIONADAS para silenciar os avisos de "unmapped target":
     * Dizemos ao MapStruct para ignorar 'id' e 'dadosBiometricos' 
     * ao mapear de um Request para uma Entidade.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dadosBiometricos", ignore = true)
    Astronauta toEntity(CriarAstronautaRequest request);

    /**
     * Converte a Entidade em um DTO de resposta.
     * Como a lógica de biometria é complexa (pegar o último registro),
     * implementamos como um 'default method'. O MapStruct usará esta implementação.
     */
    default AstronautaDTO toDTO(Astronauta astronauta) {
        if (astronauta == null) {
            return null;
        }

        String tipo = null;
        String valor = null;
        String unidade = null;
        LocalDateTime registradoEm = null;

        Optional<DadosBiometricos> ultimoDado = astronauta.getDadosBiometricos().stream()
                .max(Comparator.comparing(DadosBiometricos::getRegistradoEm));

        if (ultimoDado.isPresent()) {
            DadosBiometricos biometria = ultimoDado.get();
            tipo = biometria.getTipo();
            valor = biometria.getValor();
            unidade = biometria.getUnidade();
            registradoEm = biometria.getRegistradoEm();
        }

        // Retorna o DTO construído
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