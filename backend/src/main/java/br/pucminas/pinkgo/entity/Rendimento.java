package br.pucminas.pinkgo.entity;

import java.math.BigDecimal;

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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rendimentos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Rendimento {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private TipoRendimento tipo;

	/** Empresa, razão social, área de atuação ou descrição, conforme o tipo. */
	private String entidadeEmpregadora;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal valorMensal;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "cliente_id")
	private Cliente cliente;

	public Rendimento(TipoRendimento tipo, String entidadeEmpregadora, BigDecimal valorMensal) {
		this.tipo = tipo;
		this.entidadeEmpregadora = entidadeEmpregadora;
		this.valorMensal = valorMensal;
	}

	void vincular(Cliente cliente) {
		this.cliente = cliente;
	}
}
