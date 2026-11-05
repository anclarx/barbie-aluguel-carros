package br.pucminas.pinkgo.entity;

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
@Table(name = "automoveis")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Automovel {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String matricula;

	@Column(nullable = false, unique = true)
	private String placa;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "modelo_id")
	private Modelo modelo;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "local_id")
	private Local local;

	public Automovel(String matricula, String placa, Modelo modelo, Local local) {
		this.matricula = matricula;
		this.placa = placa;
		this.modelo = modelo;
		this.local = local;
	}
}
