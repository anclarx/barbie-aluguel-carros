package br.pucminas.pinkgo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "locais", uniqueConstraints = @UniqueConstraint(columnNames = { "bairro", "cidade", "uf" }))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Local {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String bairro;

	@Column(nullable = false)
	private String cidade;

	@Column(nullable = false, length = 2)
	private String uf;

	public Local(String bairro, String cidade, String uf) {
		this.bairro = bairro;
		this.cidade = cidade;
		this.uf = uf;
	}

	public String getDescricao() {
		return cidade + " - " + uf + " · " + bairro;
	}
}
