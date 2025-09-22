package com.MonitoramentoEspacial.middleware;

import com.MonitoramentoEspacial.aplicacao.Astronauta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AstronautaRepository extends JpaRepository<Astronauta, Long> {
}
