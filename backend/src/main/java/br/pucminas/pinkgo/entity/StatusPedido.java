package br.pucminas.pinkgo.entity;

import java.util.EnumSet;
import java.util.Set;

public enum StatusPedido {
	EM_ANALISE_FINANCEIRA,
	APROVADO,
	CONTRATO_EM_EXECUCAO,
	NEGADO,
	CANCELADO,
	CONTRATO_ENCERRADO;

	public static final Set<StatusPedido> MODIFICAVEIS = EnumSet.of(EM_ANALISE_FINANCEIRA, APROVADO);

	public boolean modificavel() {
		return MODIFICAVEIS.contains(this);
	}
}
