package com.MonitoramentoEspacial.aplicacao;

import com.MonitoramentoEspacial.interfaceExterna.EspaconaveDTO;
import com.MonitoramentoEspacial.interfaceExterna.SalvarEspaconaveRequest;

import java.util.List;

public interface EspaconaveServiceInterface {
    EspaconaveDTO criarEspaconave(SalvarEspaconaveRequest request);
    EspaconaveDTO atualizarEspaconave(Long id, SalvarEspaconaveRequest request);
    EspaconaveDTO buscarPorId(Long id);
    List<EspaconaveDTO> listarEspaconaves(String nome);
    void deletarEspaconave(Long id);
}