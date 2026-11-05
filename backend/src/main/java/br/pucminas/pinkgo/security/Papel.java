package br.pucminas.pinkgo.security;

/** Quem está logado. Vai no JWT (claim `papel`) e vira a role `ROLE_<papel>` no Spring Security. */
public enum Papel {
	/** Cliente que aluga carros. */
	CLIENTE,
	/** Agente da PinkGo, que avalia os pedidos do ponto de vista financeiro. */
	AGENTE_EMPRESA;

	public String role() {
		return "ROLE_" + name();
	}
}
