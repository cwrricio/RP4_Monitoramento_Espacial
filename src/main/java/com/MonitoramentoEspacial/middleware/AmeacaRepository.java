package com.MonitoramentoEspacial.middleware;

import com.MonitoramentoEspacial.aplicacao.dominio.Ameaca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AmeacaRepository extends JpaRepository<Ameaca, Long> {
    List<Ameaca> findByMissaoId(Long missaoId);
    List<Ameaca> findByNivelPerigoGreaterThanEqual(int nivel);
}