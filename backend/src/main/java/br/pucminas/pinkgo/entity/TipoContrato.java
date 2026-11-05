package br.pucminas.pinkgo.entity;

public enum TipoContrato {
	PROPRIEDADE_CLIENTE,
	PROPRIEDADE_EMPRESA,
	PROPRIEDADE_BANCO;

	public static TipoContrato para(boolean comCredito) {
		return comCredito ? PROPRIEDADE_BANCO : PROPRIEDADE_EMPRESA;
	}
}
