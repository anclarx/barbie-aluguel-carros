package br.pucminas.pinkgo.entity;

public enum TipoContrato {
	PROPRIEDADE_CLIENTE,
	PROPRIEDADE_EMPRESA,
	PROPRIEDADE_BANCO;

	/** Com crédito bancário o automóvel fica em nome do banco; sem crédito, da empresa. */
	public static TipoContrato para(boolean comCredito) {
		return comCredito ? PROPRIEDADE_BANCO : PROPRIEDADE_EMPRESA;
	}
}
