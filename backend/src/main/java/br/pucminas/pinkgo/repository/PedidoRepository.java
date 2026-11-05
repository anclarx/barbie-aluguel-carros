package br.pucminas.pinkgo.repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.pucminas.pinkgo.entity.Disponibilidade;
import br.pucminas.pinkgo.entity.Pedido;
import br.pucminas.pinkgo.entity.StatusPedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

	@EntityGraph(attributePaths = { "modelo", "automovel", "localRetirada", "localDevolucao" })
	Page<Pedido> findByClienteId(Long clienteId, Pageable pageable);

	@EntityGraph(attributePaths = { "modelo", "automovel", "localRetirada", "localDevolucao" })
	Page<Pedido> findByClienteIdAndStatusIn(Long clienteId, Collection<StatusPedido> status, Pageable pageable);

	List<Pedido> findByClienteId(Long clienteId);

	boolean existsByClienteIdAndStatus(Long clienteId, StatusPedido status);

	@Query("select p.status as status, count(p) as total from Pedido p where p.cliente.id = :clienteId group by p.status")
	List<ContagemPorStatus> contarPorStatus(@Param("clienteId") Long clienteId);

	/* Painel do agente da PinkGo: todos os pedidos. */

	@EntityGraph(attributePaths = { "cliente", "modelo", "automovel", "localRetirada", "localDevolucao" })
	@Query("select p from Pedido p where (:todosStatus = true or p.status in :status)")
	Page<Pedido> findParaEmpresa(@Param("todosStatus") boolean todosStatus,
			@Param("status") Collection<StatusPedido> status, Pageable pageable);

	@Query("select p.status as status, count(p) as total from Pedido p group by p.status")
	List<ContagemPorStatus> contarTodosPorStatus();

	/** Algum pedido, fora `ignorarPedidoId`, impede o automóvel no período? Veja a regra em {@link Disponibilidade}. */
	@Query("""
			select count(p) > 0 from Pedido p
			where p.automovel.id = :automovelId and p.id <> :ignorarPedidoId and """ + Disponibilidade.CONFLITO)
	boolean automovelOcupado(@Param("automovelId") Long automovelId,
			@Param("inicioComPreparo") LocalDate inicioComPreparo, @Param("fimComPreparo") LocalDate fimComPreparo,
			@Param("entrega") LocalDate entrega, @Param("ignorarPedidoId") Long ignorarPedidoId);

	default boolean automovelOcupado(Long automovelId, LocalDate retirada, LocalDate entrega, Long ignorarPedidoId) {
		return automovelOcupado(automovelId, Disponibilidade.inicioComPreparo(retirada),
				Disponibilidade.fimComPreparo(entrega), entrega, ignorarPedidoId);
	}

	interface ContagemPorStatus {
		StatusPedido getStatus();

		long getTotal();
	}
}
