package com.example.demo.api.dto;

public record AstronautaDTO(
        Long id,
        String nome,
        Integer idade,
        Boolean ativo,
        String nivelAptidaoMedica,
        Integer missoesRealizadas
) {}