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

/** Pedido de aluguel. As mudanças de estado passam pelos métodos de domínio, nunca por setters. */
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

	/** Banco que o cliente escolheu para financiar, entre os que aprovaram o crédito. */
	private String bancoAssociado;

	/** Por que o agente da PinkGo aprovou ou negou (opcional). */
	@Column(length = 500)
	private String justificativaParecer;

	@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("id")
	@Getter(AccessLevel.NONE)
	private List<PropostaCredito> propostas = new ArrayList<>();

	/**
	 * Cria o pedido em análise financeira (US03). O automóvel fica reservado nos dias do pedido enquanto ele estiver
	 * ativo; quem garante que ele estava livre é o PedidoService.
	 */
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

	/** US05: troca período e crédito. Um pedido aprovado que é modificado volta para análise. */
	public void alterar(LocalDate dataRetirada, LocalDate dataEntrega, boolean comCredito) {
		exigirModificavel("editado");
		BigDecimal totalAnterior = totalEstimado;
		definirPeriodo(dataRetirada, dataEntrega, comCredito);
		status = StatusPedido.EM_ANALISE_FINANCEIRA;
		// Volta para análise: o banco do contrato é escolhido de novo no próximo parecer.
		bancoAssociado = null;
		// Outro total muda o valor financiado: todos os bancos precisam analisar de novo.
		if (totalAnterior.compareTo(totalEstimado) != 0) propostas.forEach(PropostaCredito::reenviarParaAnalise);
	}

	/** Loja de retirada e automóvel que atende o período; podem ser os mesmos de antes. */
	public void trocarRetirada(Local novaLoja, Automovel novoAutomovel) {
		exigirModificavel("editado");
		automovel = novoAutomovel;
		localRetirada = novaLoja;
	}

	public void trocarDevolucao(Local novaLoja) {
		exigirModificavel("editado");
		localDevolucao = novaLoja;
	}

	/**
	 * Bancos escolhidos e o parcelamento em cada um. Bancos que saem têm a proposta cancelada; os que entram vão para
	 * análise; os que ficam só voltam para análise se o parcelamento mudar. Sem crédito, não há propostas.
	 */
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

	/** US06: cancelado não ocupa mais o automóvel, então os dias dele voltam a ficar livres. */
	public void cancelar() {
		exigirModificavel("cancelado");
		status = StatusPedido.CANCELADO;
	}

	/*
	 * Análise do pedido. Fluxo: em análise financeira → (com crédito: os bancos respondem sozinhos e o cliente escolhe
	 * um banco que aprovou, ou desiste do financiamento) → parecer do agente da PinkGo → aprovado ou negado → contrato
	 * em execução → contrato encerrado.
	 */

	/** O cliente escolhe, entre os bancos que aprovaram, qual vai financiar o aluguel. */
	public void escolherFinanciamento(Long bancoId) {
		exigirStatus(StatusPedido.EM_ANALISE_FINANCEIRA, "alterado");
		if (!comCredito) throw new RegraDeNegocioException("Este pedido não tem crédito bancário.");
		PropostaCredito proposta = propostaDoBanco(bancoId)
				.orElseThrow(() -> new RegraDeNegocioException("bancoId", "Este banco não está no seu pedido."));
		if (proposta.getStatus() != StatusProposta.APROVADA)
			throw new RegraDeNegocioException("bancoId", "Escolha um banco que aprovou o crédito.");
		bancoAssociado = proposta.getBanco().getNome();
	}

	/** O cliente desiste do financiamento: o aluguel passa a ser pago sem crédito e as propostas saem do pedido. */
	public void desistirDoFinanciamento() {
		exigirStatus(StatusPedido.EM_ANALISE_FINANCEIRA, "alterado");
		if (!comCredito) throw new RegraDeNegocioException("Este pedido já está sem crédito bancário.");
		comCredito = false;
		tipoContrato = TipoContrato.para(false);
		bancoAssociado = null;
		propostas.clear();
	}

	/**
	 * Falta alguma coisa para o agente poder aprovar? Com crédito, os bancos precisam ter respondido e o cliente,
	 * escolhido um deles (ou desistido do crédito). Devolve o que falta, ou vazio quando está pronto.
	 */
	public Optional<String> pendenciaParaAprovar() {
		if (!comCredito) return Optional.empty();
		if (propostas.stream().anyMatch(p -> p.getStatus() == StatusProposta.EM_ANALISE))
			return Optional.of("Os bancos ainda estão analisando o crédito.");
		if (propostas.stream().noneMatch(p -> p.getStatus() == StatusProposta.APROVADA))
			return Optional.of("Nenhum banco aprovou o crédito. O cliente precisa desistir do financiamento.");
		if (bancoAssociado == null) return Optional.of("O cliente ainda não escolheu o banco do financiamento.");
		return Optional.empty();
	}

	/**
	 * Parecer favorável do agente da PinkGo, que também decide em nome de quem o automóvel fica durante o contrato.
	 * Sem tipo informado, vale a sugestão do pedido. Propriedade do banco exige financiamento.
	 */
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

	/** Parecer contrário do agente da PinkGo; o pedido vai para o histórico. */
	public void negar(String justificativa) {
		exigirStatus(StatusPedido.EM_ANALISE_FINANCEIRA, "negado");
		registrarParecer(justificativa);
		status = StatusPedido.NEGADO;
	}

	private void registrarParecer(String justificativa) {
		this.justificativaParecer = justificativa == null || justificativa.isBlank() ? null : justificativa.trim();
	}

	/** O cliente retirou o carro: o contrato aprovado começa a valer. */
	public void iniciarContrato() {
		exigirStatus(StatusPedido.APROVADO, "posto em execução");
		status = StatusPedido.CONTRATO_EM_EXECUCAO;
	}

	/** O carro foi devolvido. */
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
		// Total estimado = diária × (dataEntrega − dataRetirada), sempre calculado no servidor.
		this.totalEstimado = modelo.getDiaria().multiply(BigDecimal.valueOf(dias()));
	}

	/** Recusa a ação quando o pedido já saiu de análise ou aprovado (US05, US06). */
	public void exigirModificavel(String acao) {
		if (!status.modificavel()) throw new RegraDeNegocioException("Este pedido não pode mais ser " + acao + ".");
	}
}
