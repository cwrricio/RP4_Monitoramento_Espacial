package com.MonitoramentoEspacial.middleware;

import com.MonitoramentoEspacial.aplicacao.dominio.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {

    /**
     * Busca todos os eventos associados a um ID de missão específico,
     * ordenados do mais recente para o mais antigo.
     */
    List<Evento> findByMissaoIdOrderByTimestampDesc(Long missaoId);
}