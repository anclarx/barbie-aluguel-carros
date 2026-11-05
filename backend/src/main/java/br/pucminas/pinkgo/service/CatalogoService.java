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

	public List<ModeloResponse> listarModelos(Long localId, LocalDate retirada, LocalDate entrega) {
		List<Modelo> modelos = modeloRepository.findNaFrota(localId);
		if (!periodo(retirada, entrega)) return modelos.stream().map(ModeloResponse::de).toList();

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

	public List<LocalResponse> listarLocais() {
		return localRepository.findAllByOrderByCidadeAscBairroAsc().stream().map(LocalResponse::de).toList();
	}

	public List<LocalResponse> listarLocaisDoModelo(Long modeloId, LocalDate retirada, LocalDate entrega) {
		if (!modeloRepository.existsById(modeloId))
			throw new RecursoNaoEncontradoException("Modelo não encontrado.");
		List<Local> locais = periodo(retirada, entrega)
				? localRepository.findComModeloLivre(modeloId, retirada, entrega)
				: localRepository.findComModelo(modeloId);
		return locais.stream().map(LocalResponse::de).toList();
	}

	private static boolean periodo(LocalDate retirada, LocalDate entrega) {
		if (retirada == null || entrega == null) return false;
		if (entrega.isBefore(retirada))
			throw new RegraDeNegocioException("entrega", "A devolução precisa ser depois da retirada.");
		return true;
	}

	public List<BancoResponse> listarBancos() {
		return bancoRepository.findAllByOrderByJurosMensalAscNomeAsc().stream().map(BancoResponse::de).toList();
	}

	public List<TipoRendimentoResponse> listarTiposRendimento() {
		return Arrays.stream(TipoRendimento.values()).map(TipoRendimentoResponse::de).toList();
	}
}
