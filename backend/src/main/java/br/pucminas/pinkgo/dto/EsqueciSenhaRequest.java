package br.pucminas.pinkgo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EsqueciSenhaRequest(
		@NotBlank(message = "Informe seu e-mail.") @Email(message = "Informe um e-mail válido.") String email) {
}
