package br.pucminas.pinkgo.dto;

/** Dados de uma etapa do cadastro para conferir se já existem: só os campos preenchidos são conferidos. */
public record VerificacaoCadastroRequest(String email, String cpf, String rg) {
}
