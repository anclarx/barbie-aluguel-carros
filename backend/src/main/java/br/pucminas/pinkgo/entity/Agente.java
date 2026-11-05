package br.pucminas.pinkgo.entity;

import br.pucminas.pinkgo.security.Papel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "agentes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Agente {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String nome;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private String senha;

	private Agente(String nome, String email, String senha) {
		this.nome = nome;
		this.email = email;
		this.senha = senha;
	}

	public static Agente daEmpresa(String nome, String email, String senha) {
		return new Agente(nome, email, senha);
	}

	public void trocarEmail(String novoEmail) {
		this.email = novoEmail;
	}

	public Papel papel() {
		return Papel.AGENTE_EMPRESA;
	}
}
