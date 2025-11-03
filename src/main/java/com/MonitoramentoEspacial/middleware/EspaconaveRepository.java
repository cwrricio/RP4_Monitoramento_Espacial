package com.MonitoramentoEspacial.middleware;

import com.MonitoramentoEspacial.aplicacao.dominio.Espaconave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EspaconaveRepository extends JpaRepository<Espaconave, Long> {
    List<Espaconave> findByNomeContainingIgnoreCase(String nome);
}