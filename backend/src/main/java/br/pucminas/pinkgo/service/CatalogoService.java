package br.pucminas.pinkgo.service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucminas.pinkgo.dto.BancoResponse;
import br.pucminas.pinkgo.dto.LocalResponse;
import br.pucminas.pinkgo.dto.ModeloResponse;
import br.pucminas.pinkgo.dto.TipoRendimentoResponse;
import br.pucminas.pinkgo.entity.Local;
import br.pucminas.pinkgo.entity.Modelo;
import br.pucminas.pinkgo.entity.TipoRendimento;
import br.pucminas.pinkgo.exception.RecursoNaoEncontradoException;
import br.pucminas.pinkgo.exception.RegraDeNegocioException;
import br.pucminas.pinkgo.repository.AutomovelRepository;
import br.pucminas.pinkgo.repository.AutomovelRepository.LivresPorModelo;
import br.pucminas.pinkgo.repository.BancoRepository;
import br.pucminas.pinkgo.repository.LocalRepository;
import br.pucminas.pinkgo.repository.ModeloRepository;

/** Dados públicos: vitrine (US16), lojas, bancos parceiros e categorias de rendimento. */
@Service
@Transactional(readOnly = true)
public class CatalogoService {

	private final ModeloRepository modeloRepository;
	private final LocalRepository localRepository;
	private final BancoRepository bancoRepository;
	private final AutomovelRepository automovelRepository;

	public CatalogoService(ModeloRepository modeloRepository, LocalRepository localRepository,
			BancoRepository bancoRepository, AutomovelRepository automovelRepository) {
		this.automovelRepository = automovelRepository;
		this.modeloRepository = modeloRepository;
		this.localRepository = localRepository;
		this.bancoRepository = bancoRepository;
	}

	/**
	 * Vitrine (US16). Com `localId`, só modelos que existem naquela loja. Com o período, só os que têm pelo menos um
	 * automóvel sem pedido ativo naqueles dias; sem ele, todos os da frota.
	 */
	public List<ModeloResponse> listarModelos(Long localId, LocalDate retirada, LocalDate entrega) {
		List<Modelo> modelos = modeloRepository.findNaFrota(localId);
		if (!periodo(retirada, entrega)) return modelos.stream().map(ModeloResponse::de).toList();

		// Quantos carros de cada modelo atendem o período inteiro; modelo sem nenhum não aparece.
		Map<Long, Long> livres = automovelRepository.contarLivresPorModelo(localId, retirada, entrega).stream()
				.collect(Collectors.toMap(LivresPorModelo::getModeloId, LivresPorModelo::getLivres));
		return modelos.stream()
				.filter(m -> livres.containsKey(m.getId()))
				.map(m -> ModeloResponse.de(m, livres.get(m.getId())))
				.toList();
	}

	public ModeloResponse buscarModelo(Long id) {
		return modeloRepository.findById(id)
				.map(ModeloResponse::de)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Modelo não encontrado."));
	}

	/** Lojas da PinkGo, onde o carro é retirado e devolvido. É uma lista fixa, cadastrada pela empresa. */
	public List<LocalResponse> listarLocais() {
		return localRepository.findAllByOrderByCidadeAscBairroAsc().stream().map(LocalResponse::de).toList();
	}

	/**
	 * Opções de retirada nos modais de pedido: lojas com o modelo e, com o período, só as que têm um automóvel dele
	 * livre naqueles dias. A devolução não passa por aqui: pode ser em qualquer loja.
	 */
	public List<LocalResponse> listarLocaisDoModelo(Long modeloId, LocalDate retirada, LocalDate entrega) {
		if (!modeloRepository.existsById(modeloId))
			throw new RecursoNaoEncontradoException("Modelo não encontrado.");
		List<Local> locais = periodo(retirada, entrega)
				? localRepository.findComModeloLivre(modeloId, retirada, entrega)
				: localRepository.findComModelo(modeloId);
		return locais.stream().map(LocalResponse::de).toList();
	}

	/** Período completo e em ordem; com uma das datas faltando, a busca ignora as datas. */
	private static boolean periodo(LocalDate retirada, LocalDate entrega) {
		if (retirada == null || entrega == null) return false;
		if (entrega.isBefore(retirada))
			throw new RegraDeNegocioException("entrega", "A devolução precisa ser depois da retirada.");
		return true;
	}

	/** Bancos que financiam o aluguel, do menor juro para o maior. */
	public List<BancoResponse> listarBancos() {
		return bancoRepository.findAllByOrderByJurosMensalAscNomeAsc().stream().map(BancoResponse::de).toList();
	}

	public List<TipoRendimentoResponse> listarTiposRendimento() {
		return Arrays.stream(TipoRendimento.values()).map(TipoRendimentoResponse::de).toList();
	}
}
