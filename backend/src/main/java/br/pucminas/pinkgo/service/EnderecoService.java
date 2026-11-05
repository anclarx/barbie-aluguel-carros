package br.pucminas.pinkgo.service;

import java.time.Duration;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import br.pucminas.pinkgo.dto.EnderecoSugestao;
import br.pucminas.pinkgo.exception.ServicoIndisponivelException;

/**
 * Autocomplete de endereço residencial com dados do OpenStreetMap, via Photon (photon.komoot.io). O Nominatim, a
 * busca oficial do OSM, proíbe autocomplete; o Photon foi feito para isso.
 *
 * A chamada passa pelo back-end para identificar a aplicação no User-Agent (exigido pela política de uso), restringir
 * a busca ao Brasil e guardar as respostas recentes, poupando o serviço gratuito.
 */
@Service
public class EnderecoService {

	@ConfigurationProperties("pinkgo.enderecos")
	public record EnderecosProperties(String url, String userAgent) {
	}

	/** Retângulo que cobre o Brasil: oeste, sul, leste, norte. */
	private static final String BBOX_BRASIL = "-74,-34,-34,6";
	private static final int MINIMO_CARACTERES = 3;
	private static final int SUGESTOES = 5;
	private static final int CACHE_MAXIMO = 500;

	private final RestClient photon;

	/** Últimas buscas, para não repetir a mesma requisição enquanto várias pessoas digitam o mesmo começo. */
	private final Map<String, List<EnderecoSugestao>> cache = Collections.synchronizedMap(
			new LinkedHashMap<>(16, 0.75f, true) {
				@Override
				protected boolean removeEldestEntry(Map.Entry<String, List<EnderecoSugestao>> mais) {
					return size() > CACHE_MAXIMO;
				}
			});

	public EnderecoService(EnderecosProperties propriedades) {
		// Sem resposta rápida, a pessoa segue digitando o endereço à mão.
		SimpleClientHttpRequestFactory fabrica = new SimpleClientHttpRequestFactory();
		fabrica.setConnectTimeout(Duration.ofSeconds(3));
		fabrica.setReadTimeout(Duration.ofSeconds(5));
		this.photon = RestClient.builder().baseUrl(propriedades.url())
				.defaultHeader("User-Agent", propriedades.userAgent())
				.requestFactory(fabrica)
				.build();
	}

	public List<EnderecoSugestao> buscar(String texto) {
		String termo = expandirAbreviacoes(texto == null ? "" : texto.trim().replaceAll("\\s+", " "));
		if (termo.length() < MINIMO_CARACTERES) return List.of();
		String chave = termo.toLowerCase(Locale.ROOT);
		List<EnderecoSugestao> guardado = cache.get(chave);
		if (guardado != null) return guardado;
		// Fora do lock: buscas diferentes não esperam umas pelas outras. Falhas não entram no cache.
		List<EnderecoSugestao> sugestoes = consultar(termo);
		cache.put(chave, sugestoes);
		return sugestoes;
	}

	private List<EnderecoSugestao> consultar(String termo) {
		try {
			PhotonResposta resposta = photon.get()
					.uri(u -> u.path("/api/").queryParam("q", termo).queryParam("limit", 15)
							.queryParam("bbox", BBOX_BRASIL).build())
					.retrieve()
					.body(PhotonResposta.class);
			return converter(resposta);
		} catch (RestClientException e) {
			throw new ServicoIndisponivelException("A busca de endereços está indisponível agora. Digite o endereço completo.", e);
		}
	}

	/** Abreviações comuns de logradouro, que o Photon não entende ("av paulista" → "avenida paulista"). */
	private static final Map<String, String> ABREVIACOES = Map.of("av", "avenida", "r", "rua", "al", "alameda",
			"tv", "travessa", "pc", "praça", "pca", "praça", "rod", "rodovia", "est", "estrada", "lgo", "largo");

	static String expandirAbreviacoes(String termo) {
		return String.join(" ", Stream.of(termo.split(" "))
				.map(p -> ABREVIACOES.getOrDefault(p.toLowerCase(Locale.ROOT).replace(".", ""), p))
				.toList());
	}

	/** Mantém só endereços do Brasil e tira os repetidos (o OSM divide uma rua em trechos, um por CEP). */
	static List<EnderecoSugestao> converter(PhotonResposta resposta) {
		if (resposta == null || resposta.features() == null) return List.of();
		Map<String, EnderecoSugestao> unicos = new LinkedHashMap<>();
		resposta.features().stream()
				.map(PhotonResposta.Feature::properties)
				.filter(Objects::nonNull)
				.filter(p -> "BR".equalsIgnoreCase(p.countrycode()) && p.city() != null)
				.map(EnderecoService::sugestao)
				.forEach(s -> unicos.putIfAbsent(
						String.join("|", Objects.toString(s.logradouro(), ""), Objects.toString(s.numero(), ""),
								Objects.toString(s.bairro(), ""), s.cidade()),
						s));
		return unicos.values().stream().limit(SUGESTOES).toList();
	}

	static EnderecoSugestao sugestao(PhotonResposta.Propriedades p) {
		// Em ruas, `name` é o próprio logradouro; em prédios e lugares, a rua vem em `street`.
		String logradouro = p.street() != null ? p.street() : p.name();
		String bairro = p.district() != null ? p.district() : p.locality();
		String uf = Estados.uf(p.state());
		String ruaENumero = p.housenumber() == null ? logradouro : logradouro + ", " + p.housenumber();
		String cidadeUf = uf == null ? p.city() : p.city() + " - " + uf;
		String descricao = String.join(", ",
				Stream.of(ruaENumero, Objects.equals(bairro, logradouro) ? null : bairro, cidadeUf, p.postcode())
						.filter(Objects::nonNull).toList());
		return new EnderecoSugestao(descricao, logradouro, p.housenumber(), bairro, p.city(), uf, p.postcode());
	}

	/** Formato GeoJSON do Photon; só os campos usados, o resto é ignorado. */
	@JsonIgnoreProperties(ignoreUnknown = true)
	record PhotonResposta(List<Feature> features) {

		@JsonIgnoreProperties(ignoreUnknown = true)
		record Feature(Propriedades properties) {
		}

		@JsonIgnoreProperties(ignoreUnknown = true)
		record Propriedades(String name, String street, String housenumber, String postcode, String district,
				String locality, String city, String state, String countrycode) {
		}
	}

	/** Nome do estado (como vem do OSM) para a sigla. */
	static final class Estados {

		private static final Map<String, String> SIGLAS = Map.ofEntries(Map.entry("Acre", "AC"),
				Map.entry("Alagoas", "AL"), Map.entry("Amapá", "AP"), Map.entry("Amazonas", "AM"), Map.entry("Bahia", "BA"),
				Map.entry("Ceará", "CE"), Map.entry("Distrito Federal", "DF"), Map.entry("Espírito Santo", "ES"),
				Map.entry("Goiás", "GO"), Map.entry("Maranhão", "MA"), Map.entry("Mato Grosso", "MT"),
				Map.entry("Mato Grosso do Sul", "MS"), Map.entry("Minas Gerais", "MG"), Map.entry("Pará", "PA"),
				Map.entry("Paraíba", "PB"), Map.entry("Paraná", "PR"), Map.entry("Pernambuco", "PE"),
				Map.entry("Piauí", "PI"), Map.entry("Rio de Janeiro", "RJ"), Map.entry("Rio Grande do Norte", "RN"),
				Map.entry("Rio Grande do Sul", "RS"), Map.entry("Rondônia", "RO"), Map.entry("Roraima", "RR"),
				Map.entry("Santa Catarina", "SC"), Map.entry("São Paulo", "SP"), Map.entry("Sergipe", "SE"),
				Map.entry("Tocantins", "TO"));

		private Estados() {
		}

		static String uf(String estado) {
			return estado == null ? null : SIGLAS.get(estado);
		}
	}
}
