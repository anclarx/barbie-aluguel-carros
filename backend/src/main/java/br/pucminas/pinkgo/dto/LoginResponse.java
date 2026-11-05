package br.pucminas.pinkgo.dto;

import java.time.Instant;

import br.pucminas.pinkgo.security.Papel;

public record LoginResponse(String token, Instant expiraEm, Papel papel, ClienteResponse cliente, AgenteResponse agente) {
}
