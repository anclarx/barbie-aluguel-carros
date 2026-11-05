package br.pucminas.pinkgo.entity;

import java.time.Instant;

import br.pucminas.pinkgo.exception.RegraDeNegocioException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Pedido de crédito enviado a um banco para financiar o aluguel. O cliente pode escolher vários bancos e comparar;
 * os valores (entrada, parcela, juros) não ficam salvos, saem do SimuladorFinanciamento a partir do total do pedido.
 */
@Entity
@Table(name = "propostas_credito", uniqueConstraints = @UniqueConstraint(columnNames = { "pedido_id", "banco_id" }))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PropostaCredito {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "pedido_id")
	private Pedido pedido;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "banco_id")
	private Banco banco;

	@Column(nullable = false)
	private int parcelas;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private StatusProposta status = StatusProposta.EM_ANALISE;

	/** Quando foi para o banco; o banco responde depois de um tempo (veja AnaliseCreditoService). */
	private Instant enviadaEm;

	/** Por que o banco aprovou ou negou, para o cliente e o agente entenderem a resposta. */
	@Column(length = 200)
	private String motivo;

	PropostaCredito(Pedido pedido, Banco banco, int parcelas) {
		this.pedido = pedido;
		this.banco = banco;
		this.parcelas = parcelas;
		this.enviadaEm = Instant.now();
	}

	/** Mudar o parcelamento muda a proposta, então o banco precisa analisar de novo. */
	void alterarParcelas(int novas) {
		if (novas == parcelas) return;
		parcelas = novas;
		reenviarParaAnalise();
	}

	void reenviarParaAnalise() {
		status = StatusProposta.EM_ANALISE;
		motivo = null;
		enviadaEm = Instant.now();
	}

	/** Resposta do banco, pela política de crédito dele. Cada envio é respondido uma vez. */
	public void responder(boolean aprovada, String motivo) {
		if (status != StatusProposta.EM_ANALISE)
			throw new RegraDeNegocioException("Esta proposta já foi respondida pelo banco.");
		this.status = aprovada ? StatusProposta.APROVADA : StatusProposta.NEGADA;
		this.motivo = motivo;
	}

	/** É a proposta que o cliente escolheu para financiar o aluguel. */
	public boolean escolhida() {
		return banco.getNome().equals(pedido.getBancoAssociado());
	}
}
