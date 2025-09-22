package com.MonitoramentoEspacial.middleware;

import com.MonitoramentoEspacial.aplicacao.dominio.Astronauta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AstronautaRepository extends JpaRepository<Astronauta, Long> {
    List<Astronauta> findByNomeContainingIgnoreCase(String nome);
    List<Astronauta> findByNivelAptidaoMedica(String nivel);
}
