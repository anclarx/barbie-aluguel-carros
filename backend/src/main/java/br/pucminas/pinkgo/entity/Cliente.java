package br.pucminas.pinkgo.entity;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import br.pucminas.pinkgo.exception.RegraDeNegocioException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Cliente {

	/** Limite do enunciado: rendimentos auferidos, no máximo 3. */
	public static final int MAX_RENDIMENTOS = 3;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Setter(AccessLevel.NONE)
	private Long id;

	@Column(nullable = false)
	private String nome;

	@Column(nullable = false, unique = true, length = 11)
	private String cpf;

	@Column(nullable = false, unique = true)
	private String rg;

	@Column(nullable = false)
	private String endereco;

	@Column(nullable = false)
	private String profissao;

	@Column(nullable = false, unique = true)
	private String email;

	/** Hash BCrypt, nunca a senha em texto. */
	@Column(nullable = false)
	private String senha;

	@OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
	@Getter(AccessLevel.NONE)
	@Setter(AccessLevel.NONE)
	private List<Rendimento> rendimentos = new ArrayList<>();

	public Cliente(String nome, String cpf, String rg, String endereco, String profissao, String email, String senha) {
		this.nome = nome;
		this.cpf = cpf;
		this.rg = rg;
		this.endereco = endereco;
		this.profissao = profissao;
		this.email = email;
		this.senha = senha;
	}

	public List<Rendimento> getRendimentos() {
		return Collections.unmodifiableList(rendimentos);
	}

	/** Substitui todos os rendimentos, respeitando o mínimo de 1 e o máximo de 3. */
	public void definirRendimentos(List<Rendimento> novos) {
		if (novos.isEmpty()) throw new RegraDeNegocioException("rendimentos", "Informe pelo menos um rendimento.");
		if (novos.size() > MAX_RENDIMENTOS)
			throw new RegraDeNegocioException("rendimentos",
					"Você pode informar no máximo " + MAX_RENDIMENTOS + " rendimentos.");
		rendimentos.clear();
		novos.forEach(r -> {
			r.vincular(this);
			rendimentos.add(r);
		});
	}
}
