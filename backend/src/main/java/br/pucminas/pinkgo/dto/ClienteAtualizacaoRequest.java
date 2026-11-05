package br.pucminas.pinkgo.dto;

import java.util.List;

import br.pucminas.pinkgo.validation.Cpf;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record ClienteAtualizacaoRequest(
		@NotBlank(message = "Informe seu nome completo.") String nome,
		@NotBlank(message = "Informe seu CPF.") @Cpf String cpf,
		@NotBlank(message = "Informe seu RG.") String rg,
		@NotBlank(message = "Informe seu endereço.") String endereco,
		@NotBlank(message = "Informe sua profissão.") String profissao,
		@NotBlank(message = "Informe seu e-mail.") @Email(message = "Informe um e-mail válido.") String email,
		String senhaAtual,
		@Size(min = 8, message = "A nova senha precisa ter pelo menos 8 caracteres.") String novaSenha,
		@NotEmpty(message = "Informe pelo menos um rendimento.") @Size(max = 3, message = "Você pode informar no máximo 3 rendimentos.") List<@Valid RendimentoRequest> rendimentos) {

	public boolean trocaSenha() {
		return novaSenha != null && !novaSenha.isBlank();
	}
}
