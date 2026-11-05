package br.pucminas.pinkgo.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import br.pucminas.pinkgo.exception.RegraDeNegocioException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
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
@Table(name = "pedidos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Pedido {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "cliente_id")
	private Cliente cliente;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "modelo_id")
	private Modelo modelo;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "automovel_id")
	private Automovel automovel;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "local_retirada_id")
	private Local localRetirada;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "local_devolucao_id")
	private Local localDevolucao;

	@Column(nullable = false)
	private LocalDate dataSolicitacao;

	@Column(nullable = false)
	private LocalDate dataRetirada;

	@Column(nullable = false)
	private LocalDate dataEntrega;

	@Column(nullable = false)
	private boolean comCredito;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal totalEstimado;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private StatusPedido status;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private TipoContrato tipoContrato;

	private String bancoAssociado;

	@Column(length = 500)
	private String justificativaParecer;

	@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("id")
	@Getter(AccessLevel.NONE)
	private List<PropostaCredito> propostas = new ArrayList<>();

	public static Pedido criar(Cliente cliente, Automovel automovel, Local localRetirada, Local localDevolucao,
			LocalDate dataRetirada, LocalDate dataEntrega, boolean comCredito, LocalDate hoje) {
		Pedido pedido = new Pedido();
		pedido.cliente = cliente;
		pedido.modelo = automovel.getModelo();
		pedido.automovel = automovel;
		pedido.localRetirada = localRetirada;
		pedido.localDevolucao = localDevolucao;
		pedido.dataSolicitacao = hoje;
		pedido.status = StatusPedido.EM_ANALISE_FINANCEIRA;
		pedido.definirPeriodo(dataRetirada, dataEntrega, comCredito);
		return pedido;
	}

	public void alterar(LocalDate dataRetirada, LocalDate dataEntrega, boolean comCredito) {
		exigirModificavel("editado");
		BigDecimal totalAnterior = totalEstimado;
		definirPeriodo(dataRetirada, dataEntrega, comCredito);
		status = StatusPedido.EM_ANALISE_FINANCEIRA;
		bancoAssociado = null;
		if (totalAnterior.compareTo(totalEstimado) != 0) propostas.forEach(PropostaCredito::reenviarParaAnalise);
	}

	public void trocarRetirada(Local novaLoja, Automovel novoAutomovel) {
		exigirModificavel("editado");
		automovel = novoAutomovel;
		localRetirada = novaLoja;
	}

	public void trocarDevolucao(Local novaLoja) {
		exigirModificavel("editado");
		localDevolucao = novaLoja;
	}

	public void definirPropostas(Map<Banco, Integer> parcelasPorBanco) {
		Map<Banco, Integer> escolhas = comCredito ? parcelasPorBanco : Map.of();
		propostas.removeIf(p -> escolhas.keySet().stream().noneMatch(b -> b.getId().equals(p.getBanco().getId())));
		escolhas.forEach((banco, parcelas) -> propostas.stream()
				.filter(p -> p.getBanco().getId().equals(banco.getId()))
				.findFirst()
				.ifPresentOrElse(p -> p.alterarParcelas(parcelas),
						() -> propostas.add(new PropostaCredito(this, banco, parcelas))));
	}

	public List<PropostaCredito> getPropostas() {
		return Collections.unmodifiableList(propostas);
	}

	public void cancelar() {
		exigirModificavel("cancelado");
		status = StatusPedido.CANCELADO;
	}

	public void escolherFinanciamento(Long bancoId) {
		exigirStatus(StatusPedido.EM_ANALISE_FINANCEIRA, "alterado");
		if (!comCredito) throw new RegraDeNegocioException("Este pedido não tem crédito bancário.");
		PropostaCredito proposta = propostaDoBanco(bancoId)
				.orElseThrow(() -> new RegraDeNegocioException("bancoId", "Este banco não está no seu pedido."));
		if (proposta.getStatus() != StatusProposta.APROVADA)
			throw new RegraDeNegocioException("bancoId", "Escolha um banco que aprovou o crédito.");
		bancoAssociado = proposta.getBanco().getNome();
	}

	public void desistirDoFinanciamento() {
		exigirStatus(StatusPedido.EM_ANALISE_FINANCEIRA, "alterado");
		if (!comCredito) throw new RegraDeNegocioException("Este pedido já está sem crédito bancário.");
		comCredito = false;
		tipoContrato = TipoContrato.para(false);
		bancoAssociado = null;
		propostas.clear();
	}

	public Optional<String> pendenciaParaAprovar() {
		if (!comCredito) return Optional.empty();
		if (propostas.stream().anyMatch(p -> p.getStatus() == StatusProposta.EM_ANALISE))
			return Optional.of("Os bancos ainda estão analisando o crédito.");
		if (propostas.stream().noneMatch(p -> p.getStatus() == StatusProposta.APROVADA))
			return Optional.of("Nenhum banco aprovou o crédito. O cliente precisa desistir do financiamento.");
		if (bancoAssociado == null) return Optional.of("O cliente ainda não escolheu o banco do financiamento.");
		return Optional.empty();
	}

	public void aprovar(String justificativa, TipoContrato tipo) {
		exigirStatus(StatusPedido.EM_ANALISE_FINANCEIRA, "aprovado");
		pendenciaParaAprovar().ifPresent(p -> {
			throw new RegraDeNegocioException(p);
		});
		if (tipo == TipoContrato.PROPRIEDADE_BANCO && !comCredito)
			throw new RegraDeNegocioException("tipoContrato", "Propriedade do banco só vale para pedidos com financiamento.");
		if (tipo != null) tipoContrato = tipo;
		registrarParecer(justificativa);
		status = StatusPedido.APROVADO;
	}

	public void negar(String justificativa) {
		exigirStatus(StatusPedido.EM_ANALISE_FINANCEIRA, "negado");
		registrarParecer(justificativa);
		status = StatusPedido.NEGADO;
	}

	private void registrarParecer(String justificativa) {
		this.justificativaParecer = justificativa == null || justificativa.isBlank() ? null : justificativa.trim();
	}

	public void iniciarContrato() {
		exigirStatus(StatusPedido.APROVADO, "posto em execução");
		status = StatusPedido.CONTRATO_EM_EXECUCAO;
	}

	public void encerrarContrato() {
		exigirStatus(StatusPedido.CONTRATO_EM_EXECUCAO, "encerrado");
		status = StatusPedido.CONTRATO_ENCERRADO;
	}

	public Optional<PropostaCredito> propostaDoBanco(Long bancoId) {
		return propostas.stream().filter(p -> p.getBanco().getId().equals(bancoId)).findFirst();
	}

	private void exigirStatus(StatusPedido esperado, String acao) {
		if (status != esperado) throw new RegraDeNegocioException("Este pedido não pode ser " + acao + " agora.");
	}

	public boolean pertenceA(Long clienteId) {
		return cliente.getId().equals(clienteId);
	}

	public long dias() {
		return ChronoUnit.DAYS.between(dataRetirada, dataEntrega);
	}

	private void definirPeriodo(LocalDate dataRetirada, LocalDate dataEntrega, boolean comCredito) {
		this.dataRetirada = dataRetirada;
		this.dataEntrega = dataEntrega;
		this.comCredito = comCredito;
		this.tipoContrato = TipoContrato.para(comCredito);
		this.totalEstimado = modelo.getDiaria().multiply(BigDecimal.valueOf(dias()));
	}

	public void exigirModificavel(String acao) {
		if (!status.modificavel()) throw new RegraDeNegocioException("Este pedido não pode mais ser " + acao + ".");
	}
}
