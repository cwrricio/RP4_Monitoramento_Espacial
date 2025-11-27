package com.MonitoramentoEspacial.middleware;

import com.MonitoramentoEspacial.aplicacao.dominio.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {

    // Método antigo (pode manter se quiser, mas recomendamos usar o Top100)
    List<Evento> findByMissaoIdOrderByTimestampDesc(Long missaoId);

    // NOVO: Limita a 100 resultados para performance
    List<Evento> findTop100ByMissaoIdOrderByTimestampDesc(Long missaoId);
}