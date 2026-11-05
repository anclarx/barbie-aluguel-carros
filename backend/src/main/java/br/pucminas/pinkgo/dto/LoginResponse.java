package br.pucminas.pinkgo.dto;

import java.time.Instant;

import br.pucminas.pinkgo.security.Papel;

/** Resposta do login: o token e quem entrou. Só um entre `cliente` e `agente` vem preenchido, conforme o papel. */
public record LoginResponse(String token, Instant expiraEm, Papel papel, ClienteResponse cliente, AgenteResponse agente) {
}
