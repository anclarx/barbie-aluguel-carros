package br.pucminas.pinkgo.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.pucminas.pinkgo.entity.Automovel;
import br.pucminas.pinkgo.entity.Disponibilidade;
import jakarta.persistence.LockModeType;

public interface AutomovelRepository extends JpaRepository<Automovel, Long> {

	/*
	 * Os automóveis ficam travados até o fim da transação. Um segundo pedido simultâneo para o mesmo modelo espera
	 * aqui e, quando confere os pedidos depois, já enxerga o primeiro: os dois não ficam com o mesmo carro.
	 */

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select a from Automovel a where a.modelo.id = :modeloId and a.local.id = :localId order by a.id")
	List<Automovel> travarDoModeloNoLocal(@Param("modeloId") Long modeloId, @Param("localId") Long localId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select a from Automovel a where a.modelo.id = :modeloId order by a.id")
	List<Automovel> travarDoModelo(@Param("modeloId") Long modeloId);

	/** Quantos automóveis de cada modelo, no local (ou em todos), estão livres no período, preparação incluída. */
	@Query("""
			select a.modelo.id as modeloId, count(a) as livres from Automovel a
			where (:localId is null or a.local.id = :localId)
			and not exists (select 1 from Pedido p where p.automovel = a and """ + Disponibilidade.CONFLITO + """
			)
			group by a.modelo.id
			""")
	List<LivresPorModelo> contarLivresPorModelo(@Param("localId") Long localId,
			@Param("inicioComPreparo") LocalDate inicioComPreparo, @Param("fimComPreparo") LocalDate fimComPreparo,
			@Param("entrega") LocalDate entrega);

	default List<LivresPorModelo> contarLivresPorModelo(Long localId, LocalDate retirada, LocalDate entrega) {
		return contarLivresPorModelo(localId, Disponibilidade.inicioComPreparo(retirada),
				Disponibilidade.fimComPreparo(entrega), entrega);
	}

	interface LivresPorModelo {
		Long getModeloId();

		long getLivres();
	}
}
