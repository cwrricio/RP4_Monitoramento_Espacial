package com.MonitoramentoEspacial.middleware;

import com.MonitoramentoEspacial.aplicacao.dominio.ProtocoloEmergencial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProtocoloEmergencialRepository extends JpaRepository<ProtocoloEmergencial, Long> {

    /**
     * Busca todos os protocolos acionados para um ID de missão específico,
     * ordenados do mais recente (acionado por último) para o mais antigo.
     */
    List<ProtocoloEmergencial> findByMissaoIdOrderByAcionadoEmDesc(Long missaoId);
}