package br.pucminas.pinkgo.service;

import java.util.List;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucminas.pinkgo.dto.ClienteAtualizacaoRequest;
import br.pucminas.pinkgo.dto.ClienteCadastroRequest;
import br.pucminas.pinkgo.dto.ClienteResponse;
import br.pucminas.pinkgo.dto.RendimentoRequest;
import br.pucminas.pinkgo.dto.VerificacaoCadastroRequest;
import br.pucminas.pinkgo.entity.Cliente;
import br.pucminas.pinkgo.entity.Pedido;
import br.pucminas.pinkgo.entity.Rendimento;
import br.pucminas.pinkgo.entity.StatusPedido;
import br.pucminas.pinkgo.exception.ConflitoException;
import br.pucminas.pinkgo.exception.RecursoNaoEncontradoException;
import br.pucminas.pinkgo.exception.RegraDeNegocioException;
import br.pucminas.pinkgo.repository.AgenteRepository;
import br.pucminas.pinkgo.repository.ClienteRepository;
import br.pucminas.pinkgo.repository.PedidoRepository;
import br.pucminas.pinkgo.repository.TokenRedefinicaoSenhaRepository;
import br.pucminas.pinkgo.validation.Documentos;

/** CRUD de clientes: cadastro (US01) e perfil (US07). */
@Service
@Transactional
public class ClienteService {

	private final ClienteRepository clienteRepository;
	private final PedidoRepository pedidoRepository;
	private final AgenteRepository agenteRepository;
	private final TokenRedefinicaoSenhaRepository tokenRepository;
	private final PasswordEncoder passwordEncoder;

	public ClienteService(ClienteRepository clienteRepository, PedidoRepository pedidoRepository,
			AgenteRepository agenteRepository, TokenRedefinicaoSenhaRepository tokenRepository,
			PasswordEncoder passwordEncoder) {
		this.clienteRepository = clienteRepository;
		this.pedidoRepository = pedidoRepository;
		this.agenteRepository = agenteRepository;
		this.tokenRepository = tokenRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public ClienteResponse cadastrar(ClienteCadastroRequest req) {
		String cpf = Documentos.cpf(req.cpf());
		String email = normalizarEmail(req.email());
		String rg = rg(req.rg());
		garantirEmailLivre(email);
		garantirCpfLivre(cpf);
		garantirRgLivre(rg);

		Cliente cliente = new Cliente(req.nome().trim(), cpf, rg, req.endereco().trim(), req.profissao().trim(), email,
				passwordEncoder.encode(req.senha()));
		cliente.definirRendimentos(paraEntidades(req.rendimentos()));
		return ClienteResponse.de(clienteRepository.save(cliente));
	}

	/**
	 * Cada etapa do cadastro confere os seus dados antes de deixar avançar: e-mail na primeira, CPF e RG na segunda.
	 * Só os campos enviados são conferidos; o primeiro repetido responde 409 com o campo.
	 */
	@Transactional(readOnly = true)
	public void verificarCadastro(VerificacaoCadastroRequest req) {
		if (preenchido(req.email())) garantirEmailLivre(normalizarEmail(req.email()));
		if (preenchido(req.cpf())) garantirCpfLivre(Documentos.cpf(req.cpf()));
		if (preenchido(req.rg())) garantirRgLivre(rg(req.rg()));
	}

	// O login é um só para clientes e agentes, então o e-mail não pode repetir entre eles.
	private void garantirEmailLivre(String email) {
		if (clienteRepository.existsByEmailIgnoreCase(email) || agenteRepository.existsByEmailIgnoreCase(email))
			throw new ConflitoException("email", "Já existe uma conta com este e-mail.");
	}

	private void garantirCpfLivre(String cpf) {
		if (clienteRepository.existsByCpf(cpf)) throw new ConflitoException("cpf", "Já existe uma conta com este CPF.");
	}

	private void garantirRgLivre(String rg) {
		if (clienteRepository.existsByRg(rg)) throw new ConflitoException("rg", "Já existe uma conta com este RG.");
	}

	private static boolean preenchido(String valor) {
		return valor != null && !valor.isBlank();
	}

	@Transactional(readOnly = true)
	public ClienteResponse buscar(Long id) {
		return ClienteResponse.de(cliente(id));
	}

	public ClienteResponse atualizar(Long id, ClienteAtualizacaoRequest req) {
		Cliente cliente = cliente(id);
		String cpf = Documentos.cpf(req.cpf());
		String email = normalizarEmail(req.email());
		String rg = rg(req.rg());
		if (clienteRepository.existsByEmailIgnoreCaseAndIdNot(email, id) || agenteRepository.existsByEmailIgnoreCase(email))
			throw new ConflitoException("email", "Já existe uma conta com este e-mail.");
		if (clienteRepository.existsByCpfAndIdNot(cpf, id))
			throw new ConflitoException("cpf", "Já existe uma conta com este CPF.");
		if (clienteRepository.existsByRgAndIdNot(rg, id))
			throw new ConflitoException("rg", "Já existe uma conta com este RG.");

		if (req.trocaSenha()) {
			if (req.senhaAtual() == null || !passwordEncoder.matches(req.senhaAtual(), cliente.getSenha()))
				throw new RegraDeNegocioException("senhaAtual", "A senha atual não confere.");
			cliente.setSenha(passwordEncoder.encode(req.novaSenha()));
		}

		cliente.setNome(req.nome().trim());
		cliente.setCpf(cpf);
		cliente.setRg(rg);
		cliente.setEndereco(req.endereco().trim());
		cliente.setProfissao(req.profissao().trim());
		cliente.setEmail(email);
		cliente.definirRendimentos(paraEntidades(req.rendimentos()));
		// O flush grava os rendimentos novos agora, para a resposta já sair com os ids gerados.
		return ClienteResponse.de(clienteRepository.saveAndFlush(cliente));
	}

	/** US07: a conta não pode ser excluída com contrato em execução. Pedidos em aberto são cancelados antes. */
	public void excluir(Long id) {
		Cliente cliente = cliente(id);
		if (pedidoRepository.existsByClienteIdAndStatus(id, StatusPedido.CONTRATO_EM_EXECUCAO))
			throw new RegraDeNegocioException("Você tem um contrato em execução. A conta só pode ser excluída depois que ele for encerrado.");
		List<Pedido> pedidos = pedidoRepository.findByClienteId(id);
		pedidos.stream().filter(p -> p.getStatus().modificavel()).forEach(Pedido::cancelar);
		pedidoRepository.deleteAll(pedidos);
		tokenRepository.deleteByClienteId(id);
		clienteRepository.delete(cliente);
	}

	private Cliente cliente(Long id) {
		return clienteRepository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado."));
	}

	/** RG só com dígitos (e X); os formatos variam por estado, então só exige um tamanho mínimo. */
	private static String rg(String valor) {
		String rg = Documentos.rg(valor);
		if (rg.length() < 5 || rg.length() > 14) throw new RegraDeNegocioException("rg", "RG inválido.");
		return rg;
	}

	private static String normalizarEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private static List<Rendimento> paraEntidades(List<RendimentoRequest> rendimentos) {
		return rendimentos.stream().map(RendimentoRequest::paraEntidade).toList();
	}
}
