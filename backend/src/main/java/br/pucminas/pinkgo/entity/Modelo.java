package br.pucminas.pinkgo.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/** Modelo de carro da vitrine. Os automóveis físicos (com placa) ficam em {@link Automovel}. */
@Entity
@Table(name = "modelos")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Modelo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String marca;

	@Column(nullable = false)
	private String nome;

	@Column(nullable = false)
	private Integer ano;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal diaria;

	private String cambio;
	private String combustivel;
	private Integer assentos;
	private Integer portas;
	private String seguro;
	private String portaMalas;
	private String carroceria;

	@Column(nullable = false)
	private String imagemUrl;

	@ElementCollection
	@CollectionTable(name = "modelo_fotos", joinColumns = @JoinColumn(name = "modelo_id"))
	@OrderColumn(name = "ordem")
	@Column(name = "url", nullable = false)
	@Builder.Default
	private List<String> fotos = new ArrayList<>();

	/** Copia os dados de vitrine de outro modelo (o da carga inicial), mantendo o id e os automóveis. */
	public void atualizarCom(Modelo dados) {
		marca = dados.marca;
		ano = dados.ano;
		diaria = dados.diaria;
		cambio = dados.cambio;
		combustivel = dados.combustivel;
		assentos = dados.assentos;
		portas = dados.portas;
		seguro = dados.seguro;
		portaMalas = dados.portaMalas;
		carroceria = dados.carroceria;
		imagemUrl = dados.imagemUrl;
		// Mexer na lista faz o Hibernate regravá-la inteira; só troca quando as fotos mudaram.
		if (!fotos.equals(dados.fotos)) {
			fotos.clear();
			fotos.addAll(dados.fotos);
		}
	}
}
