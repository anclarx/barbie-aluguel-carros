package br.pucminas.pinkgo.dto;

import java.math.BigDecimal;
import java.util.List;

import br.pucminas.pinkgo.entity.Banco;

public record BancoResponse(Long id, String nome, BigDecimal jurosMensal, int parcelasMaximas, BigDecimal entradaMinima,
		List<Integer> opcoesParcelas) {

	public static BancoResponse de(Banco b) {
		return new BancoResponse(b.getId(), b.getNome(), b.getJurosMensal(), b.getParcelasMaximas(), b.getEntradaMinima(),
				b.opcoesParcelas());
	}
}
