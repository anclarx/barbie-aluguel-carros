package br.pucminas.pinkgo.validation;

import java.util.Locale;

/** Normaliza documentos para guardar e comparar sem pontuação (o front aplica a máscara só na tela). */
public final class Documentos {

	private Documentos() {
	}

	/** "529.982.247-25" → "52998224725". */
	public static String cpf(String cpf) {
		return CpfValidator.apenasDigitos(cpf);
	}

	/** "12.345.678-x" → "12345678X". Mantém o X, usado como dígito verificador em alguns estados. */
	public static String rg(String rg) {
		return rg == null ? "" : rg.toUpperCase(Locale.ROOT).replaceAll("[^0-9X]", "");
	}
}
