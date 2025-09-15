package com.example.demo.api.dto;

public record AtualizaAstronautaRequest(
        String nome,
        Integer idade,
        Boolean ativo,
        String nivelAptidaoMedica,
        Integer missoesRealizadas
) {}