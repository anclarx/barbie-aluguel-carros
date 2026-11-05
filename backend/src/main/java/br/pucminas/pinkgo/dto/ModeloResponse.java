package br.pucminas.pinkgo.dto;

import java.math.BigDecimal;
import java.util.List;

import br.pucminas.pinkgo.entity.Modelo;

/**
 * Cartão da vitrine e modal "Detalhes do carro". Nunca inclui a placa (US16). `disponiveis` é quantos automóveis
 * do modelo estão livres no período buscado; fica nulo quando a busca não tem período.
 */
public record ModeloResponse(Long id, String marca, String nome, Integer ano, BigDecimal diaria, String cambio,
		String combustivel, Integer assentos, Integer portas, String seguro, String portaMalas, String carroceria,
		String imagemUrl, List<String> fotos, Long disponiveis) {

	public static ModeloResponse de(Modelo m) {
		return de(m, null);
	}

	public static ModeloResponse de(Modelo m, Long disponiveis) {
		return new ModeloResponse(m.getId(), m.getMarca(), m.getNome(), m.getAno(), m.getDiaria(), m.getCambio(),
				m.getCombustivel(), m.getAssentos(), m.getPortas(), m.getSeguro(), m.getPortaMalas(), m.getCarroceria(),
				Imagens.url(m.getImagemUrl()), m.getFotos().stream().map(Imagens::url).toList(), disponiveis);
	}
}
