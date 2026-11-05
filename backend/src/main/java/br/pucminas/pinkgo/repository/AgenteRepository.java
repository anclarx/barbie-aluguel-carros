package br.pucminas.pinkgo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.pucminas.pinkgo.entity.Agente;

public interface AgenteRepository extends JpaRepository<Agente, Long> {

	Optional<Agente> findByEmailIgnoreCase(String email);

	boolean existsByEmailIgnoreCase(String email);
}
