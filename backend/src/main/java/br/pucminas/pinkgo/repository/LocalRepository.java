package br.pucminas.pinkgo.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.pucminas.pinkgo.entity.Disponibilidade;
import br.pucminas.pinkgo.entity.Local;

public interface LocalRepository extends JpaRepository<Local, Long> {

	List<Local> findAllByOrderByCidadeAscBairroAsc();

	/** Lojas que têm o modelo na frota, sem olhar datas. */
	@Query("""
			select l from Local l
			where exists (select 1 from Automovel a where a.local = l and a.modelo.id = :modeloId)
			order by l.cidade, l.bairro
			""")
	List<Local> findComModelo(@Param("modeloId") Long modeloId);

	/** Lojas com pelo menos um automóvel do modelo livre no período, preparação incluída. */
	@Query("""
			select l from Local l
			where exists (
				select 1 from Automovel a
				where a.local = l and a.modelo.id = :modeloId
				and not exists (select 1 from Pedido p where p.automovel = a and """ + Disponibilidade.CONFLITO + """
				)
			)
			order by l.cidade, l.bairro
			""")
	List<Local> findComModeloLivre(@Param("modeloId") Long modeloId,
			@Param("inicioComPreparo") LocalDate inicioComPreparo, @Param("fimComPreparo") LocalDate fimComPreparo,
			@Param("entrega") LocalDate entrega);

	default List<Local> findComModeloLivre(Long modeloId, LocalDate retirada, LocalDate entrega) {
		return findComModeloLivre(modeloId, Disponibilidade.inicioComPreparo(retirada),
				Disponibilidade.fimComPreparo(entrega), entrega);
	}
}
