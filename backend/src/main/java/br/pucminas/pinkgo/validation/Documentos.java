package br.pucminas.pinkgo.validation;

import java.util.Locale;

public final class Documentos {

	private Documentos() {
	}

	public static String cpf(String cpf) {
		return CpfValidator.apenasDigitos(cpf);
	}

	public static String rg(String rg) {
		return rg == null ? "" : rg.toUpperCase(Locale.ROOT).replaceAll("[^0-9X]", "");
	}
}
