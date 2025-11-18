package com.MonitoramentoEspacial.aplicacao;

// IMPORTES ADICIONADOS
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção customizada para ser lançada quando um recurso
 * não é encontrado no banco de dados.
 *
 * A ANOTAÇÃO @ResponseStatus(HttpStatus.NOT_FOUND) diz ao Spring para
 * automaticamente retornar um erro HTTP 404 (Not Found) quando esta exceção
 * é lançada por um Controller. (Esta era a parte que faltava)
 */
@ResponseStatus(HttpStatus.NOT_FOUND) // <-- ADICIONADO
public class RecursoNaoEncontradoException extends RuntimeException {
    
    public RecursoNaoEncontradoException(String message) {
        super(message);
    }
}