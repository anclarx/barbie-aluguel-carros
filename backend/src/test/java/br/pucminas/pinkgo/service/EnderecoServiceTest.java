package br.pucminas.pinkgo.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

import br.pucminas.pinkgo.dto.EnderecoSugestao;
import br.pucminas.pinkgo.service.EnderecoService.PhotonResposta;
import br.pucminas.pinkgo.service.EnderecoService.PhotonResposta.Feature;
import br.pucminas.pinkgo.service.EnderecoService.PhotonResposta.Propriedades;

class EnderecoServiceTest {

	private static Feature rua(String nome, String numero, String bairro, String cep) {
		return new Feature(new Propriedades(nome, null, numero, cep, bairro, bairro, "Belo Horizonte", "Minas Gerais", "BR"));
	}

	@Test
	void montaDescricaoComRuaNumeroBairroCidadeUfECep() {
		EnderecoSugestao s = EnderecoService.converter(
				new PhotonResposta(List.of(rua("Rua da Bahia", "1148", "Centro", "30160-011")))).getFirst();

		assertThat(s.descricao()).isEqualTo("Rua da Bahia, 1148, Centro, Belo Horizonte - MG, 30160-011");
		assertThat(s.uf()).isEqualTo("MG");
		assertThat(s.numero()).isEqualTo("1148");
	}

	@Test
	void juntaTrechosDaMesmaRuaEIgnoraOutrosPaises() {
		Feature exterior = new Feature(
				new Propriedades("Rua Augusta", null, null, "1000", null, null, "Lisboa", "Lisboa", "PT"));

		List<EnderecoSugestao> sugestoes = EnderecoService.converter(new PhotonResposta(List.of(
				rua("Rua da Bahia", null, "Lourdes", "30160-017"),
				rua("Rua da Bahia", null, "Lourdes", "30160-019"),
				exterior,
				rua("Rua da Bahia", null, "Centro", "30160-011"))));

		assertThat(sugestoes).extracting(EnderecoSugestao::bairro).containsExactly("Lourdes", "Centro");
	}

	@Test
	void lugarComRuaSeparadaUsaARua() {
		Feature predio = new Feature(new Propriedades("Edifício Rosa", "Avenida Afonso Pena", "1500", null, "Centro",
				null, "Belo Horizonte", "Minas Gerais", "BR"));

		EnderecoSugestao s = EnderecoService.converter(new PhotonResposta(List.of(predio))).getFirst();

		assertThat(s.descricao()).isEqualTo("Avenida Afonso Pena, 1500, Centro, Belo Horizonte - MG");
	}

	@Test
	void expandeAbreviacoesDeLogradouro() {
		assertThat(EnderecoService.expandirAbreviacoes("Av. Paulista 1000")).isEqualTo("avenida Paulista 1000");
		assertThat(EnderecoService.expandirAbreviacoes("r da bahia")).isEqualTo("rua da bahia");
		assertThat(EnderecoService.expandirAbreviacoes("Rua Avaí")).isEqualTo("Rua Avaí");
	}

	@Test
	void respostaVaziaNaoQuebra() {
		assertThat(EnderecoService.converter(null)).isEmpty();
		assertThat(EnderecoService.converter(new PhotonResposta(null))).isEmpty();
	}
}
