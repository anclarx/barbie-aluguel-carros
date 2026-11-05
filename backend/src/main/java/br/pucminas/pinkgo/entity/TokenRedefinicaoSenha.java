package br.pucminas.pinkgo.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tokens_redefinicao_senha")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TokenRedefinicaoSenha {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 64)
	private String tokenHash;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "cliente_id")
	private Cliente cliente;

	@Column(nullable = false)
	private Instant expiraEm;

	private Instant usadoEm;

	public TokenRedefinicaoSenha(String tokenHash, Cliente cliente, Instant expiraEm) {
		this.tokenHash = tokenHash;
		this.cliente = cliente;
		this.expiraEm = expiraEm;
	}

	public boolean valido(Instant agora) {
		return usadoEm == null && agora.isBefore(expiraEm);
	}

	public void usar(Instant agora) {
		usadoEm = agora;
	}
}
