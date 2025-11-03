package com.MonitoramentoEspacial.middleware;

import com.MonitoramentoEspacial.aplicacao.dominio.OperadorDeMissao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperadorDeMissaoRepository extends JpaRepository<OperadorDeMissao, Long> {
    List<OperadorDeMissao> findByNomeContainingIgnoreCase(String nome);
}