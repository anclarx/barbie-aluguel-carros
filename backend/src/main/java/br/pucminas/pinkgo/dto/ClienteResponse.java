package br.pucminas.pinkgo.dto;

import java.util.List;

import br.pucminas.pinkgo.entity.Cliente;

/** Dados do cliente sem a senha. */
public record ClienteResponse(Long id, String nome, String cpf, String rg, String endereco, String profissao,
		String email, List<RendimentoResponse> rendimentos) {

	public static ClienteResponse de(Cliente c) {
		return new ClienteResponse(c.getId(), c.getNome(), c.getCpf(), c.getRg(), c.getEndereco(), c.getProfissao(),
				c.getEmail(), c.getRendimentos().stream().map(RendimentoResponse::de).toList());
	}
}
