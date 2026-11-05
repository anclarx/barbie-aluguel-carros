package br.pucminas.pinkgo.entity;

/** Categorias de rendimento. `campo` é o rótulo do campo extra que a categoria pede no cadastro, quando pede. */
public enum TipoRendimento {
	EMPREGO_CLT_PUBLICO("Emprego formal (CLT / Servidor público)", "Nome empresa"),
	PJ_MEI("Pessoa jurídica (PJ / MEI)", "Razão social"),
	AUTONOMO("Autônomo / Profissional liberal", "Área de atuação"),
	APOSENTADORIA("Aposentadoria / Pensão", null),
	ALUGUEL("Renda de aluguel", null),
	INVESTIMENTO("Investimentos", null),
	OUTRO("Outro", "Descrição");

	private final String rotulo;
	private final String campo;

	TipoRendimento(String rotulo, String campo) {
		this.rotulo = rotulo;
		this.campo = campo;
	}

	public String getRotulo() {
		return rotulo;
	}

	public String getCampo() {
		return campo;
	}
}
