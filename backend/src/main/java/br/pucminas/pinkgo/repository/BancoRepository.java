package br.pucminas.pinkgo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.pucminas.pinkgo.entity.Banco;

public interface BancoRepository extends JpaRepository<Banco, Long> {

	List<Banco> findAllByOrderByJurosMensalAscNomeAsc();
}
