package br.pucminas.pinkgo.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CpfValidator implements ConstraintValidator<Cpf, String> {

	/** Remove pontos, traço e espaços. */
	public static String apenasDigitos(String cpf) {
		return cpf == null ? "" : cpf.replaceAll("\\D", "");
	}

	@Override
	public boolean isValid(String valor, ConstraintValidatorContext context) {
		// Campo vazio é responsabilidade do @NotBlank.
		if (valor == null || valor.isBlank()) return true;
		String cpf = apenasDigitos(valor);
		if (cpf.length() != 11 || cpf.chars().distinct().count() == 1) return false;
		return digito(cpf, 9) == cpf.charAt(9) - '0' && digito(cpf, 10) == cpf.charAt(10) - '0';
	}

	private static int digito(String cpf, int tamanho) {
		int soma = 0;
		for (int i = 0; i < tamanho; i++) soma += (cpf.charAt(i) - '0') * (tamanho + 1 - i);
		return (soma * 10 % 11) % 10;
	}
}
