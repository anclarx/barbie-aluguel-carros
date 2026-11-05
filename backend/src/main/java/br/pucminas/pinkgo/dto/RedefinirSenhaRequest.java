package br.pucminas.pinkgo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** `token` é o que veio no link do e-mail. */
public record RedefinirSenhaRequest(
		@NotBlank(message = "Link inválido.") String token,
		@NotBlank(message = "Informe a nova senha.") @Size(min = 8, message = "A senha precisa ter pelo menos 8 caracteres.") String novaSenha) {
}
