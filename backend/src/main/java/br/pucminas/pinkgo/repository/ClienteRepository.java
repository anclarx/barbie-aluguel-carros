package br.pucminas.pinkgo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.pucminas.pinkgo.entity.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

	Optional<Cliente> findByEmailIgnoreCase(String email);

	boolean existsByEmailIgnoreCase(String email);

	boolean existsByCpf(String cpf);

	boolean existsByRg(String rg);

	boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

	boolean existsByCpfAndIdNot(String cpf, Long id);

	boolean existsByRgAndIdNot(String rg, Long id);
}
