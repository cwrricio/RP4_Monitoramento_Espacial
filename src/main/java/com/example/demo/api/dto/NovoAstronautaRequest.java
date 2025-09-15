package com.example.demo.api.dto;

public record NovoAstronautaRequest(
        String nome,
        Integer idade,
        Boolean ativo,
        String nivelAptidaoMedica,
        Integer missoesRealizadas
) {}
