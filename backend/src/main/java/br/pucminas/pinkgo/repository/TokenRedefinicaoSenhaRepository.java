package br.pucminas.pinkgo.repository;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.pucminas.pinkgo.entity.TokenRedefinicaoSenha;

public interface TokenRedefinicaoSenhaRepository extends JpaRepository<TokenRedefinicaoSenha, Long> {

	Optional<TokenRedefinicaoSenha> findByTokenHash(String tokenHash);

	/** Pedir um link novo invalida os anteriores do mesmo cliente. */
	@Modifying
	@Query("update TokenRedefinicaoSenha t set t.usadoEm = :agora where t.cliente.id = :clienteId and t.usadoEm is null")
	void invalidarDoCliente(@Param("clienteId") Long clienteId, @Param("agora") Instant agora);

	void deleteByClienteId(Long clienteId);
}
