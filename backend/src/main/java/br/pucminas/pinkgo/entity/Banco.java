package br.pucminas.pinkgo.entity;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.IntStream;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Banco agente que concede o crédito do aluguel, com as condições que ele oferece. */
@Entity
@Table(name = "bancos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Banco {

	/** As opções de parcelamento andam de 6 em 6 meses até o máximo do banco (6x, 12x, 18x…). */
	private static final int PASSO_PARCELAS = 6;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String nome;

	/** Juros ao mês em %, como "1.49". */
	@Column(nullable = false, precision = 5, scale = 2)
	private BigDecimal jurosMensal;

	@Column(nullable = false)
	private int parcelasMaximas;

	/** Entrada mínima em % do total do aluguel, como "10". */
	@Column(nullable = false, precision = 5, scale = 2)
	private BigDecimal entradaMinima;

	public Banco(String nome, BigDecimal jurosMensal, int parcelasMaximas, BigDecimal entradaMinima) {
		this.nome = nome;
		this.jurosMensal = jurosMensal;
		this.parcelasMaximas = parcelasMaximas;
		this.entradaMinima = entradaMinima;
	}

	public List<Integer> opcoesParcelas() {
		return IntStream.rangeClosed(1, parcelasMaximas / PASSO_PARCELAS).map(i -> i * PASSO_PARCELAS).boxed().toList();
	}

	public boolean aceitaParcelas(int parcelas) {
		return opcoesParcelas().contains(parcelas);
	}
}
