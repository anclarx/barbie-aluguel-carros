package br.pucminas.pinkgo.security;

public enum Papel {
	CLIENTE,
	AGENTE_EMPRESA;

	public String role() {
		return "ROLE_" + name();
	}
}
