package br.pucminas.pinkgo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.pucminas.pinkgo.entity.Modelo;

public interface ModeloRepository extends JpaRepository<Modelo, Long> {

	/** Modelos com automóvel no local informado, ou em qualquer um quando `localId` é nulo. Não olha datas. */
	@EntityGraph(attributePaths = "fotos")
	@Query("""
			select m from Modelo m
			where exists (
				select 1 from Automovel a
				where a.modelo = m and (:localId is null or a.local.id = :localId)
			)
			order by m.id
			""")
	List<Modelo> findNaFrota(@Param("localId") Long localId);

	Optional<Modelo> findByNome(String nome);
}
