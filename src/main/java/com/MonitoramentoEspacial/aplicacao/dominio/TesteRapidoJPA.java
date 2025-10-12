package com.MonitoramentoEspacial.aplicacao.dominio;

import com.MonitoramentoEspacial.middleware.AstronautaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TesteRapidoJPA implements CommandLineRunner {

    @Autowired
    private AstronautaRepository astronautaRepository;

    @Override
    public void run(String... args) throws Exception {
        // Criar astronauta de teste
        Astronauta astro = new Astronauta();
        astro.setNome("Teste Astronauta");
        astro.setNivelAptidaoMedica("Alto");
        astro.setIdade(35);
        astro.setMissoesRealizadas(0);
        astro.setAtivo(true);
     

        // Salvar no banco
        astronautaRepository.save(astro);

        System.out.println("Astronauta salvo com sucesso! ID: " + astro.getId());
    }
}
