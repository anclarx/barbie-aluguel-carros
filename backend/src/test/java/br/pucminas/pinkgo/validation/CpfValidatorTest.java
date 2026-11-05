package br.pucminas.pinkgo.validation;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class CpfValidatorTest {

	private final CpfValidator validator = new CpfValidator();

	@ParameterizedTest
	@ValueSource(strings = { "52998224725", "529.982.247-25", "111.444.777-35" })
	void aceitaCpfValido(String cpf) {
		assertThat(validator.isValid(cpf, null)).isTrue();
	}

	@ParameterizedTest
	@ValueSource(strings = { "52998224724", "111.111.111-11", "1234", "abc.def.ghi-jk" })
	void recusaCpfInvalido(String cpf) {
		assertThat(validator.isValid(cpf, null)).isFalse();
	}
}
