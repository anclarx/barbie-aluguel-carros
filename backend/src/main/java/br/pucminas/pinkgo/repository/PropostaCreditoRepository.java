package br.pucminas.pinkgo.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.pucminas.pinkgo.entity.PropostaCredito;

public interface PropostaCreditoRepository extends JpaRepository<PropostaCredito, Long> {

	@Query("""
			select p from PropostaCredito p join fetch p.pedido pe join fetch p.banco
			where p.status = br.pucminas.pinkgo.entity.StatusProposta.EM_ANALISE
			and pe.status = br.pucminas.pinkgo.entity.StatusPedido.EM_ANALISE_FINANCEIRA
			and (p.enviadaEm is null or p.enviadaEm <= :limite)
			""")
	List<PropostaCredito> findAguardandoResposta(@Param("limite") Instant limite);
}
