package br.pucminas.pinkgo.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.pucminas.pinkgo.dto.FinanciamentoRequest;
import br.pucminas.pinkgo.dto.PaginaResponse;
import br.pucminas.pinkgo.dto.PedidoEdicaoRequest;
import br.pucminas.pinkgo.dto.PedidoRequest;
import br.pucminas.pinkgo.dto.PedidoResponse;
import br.pucminas.pinkgo.dto.ResumoPedidosResponse;
import br.pucminas.pinkgo.entity.StatusPedido;
import br.pucminas.pinkgo.security.UsuarioLogado;
import br.pucminas.pinkgo.service.PedidoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

	private final PedidoService pedidoService;

	public PedidoController(PedidoService pedidoService) {
		this.pedidoService = pedidoService;
	}

	@GetMapping
	public PaginaResponse<PedidoResponse> listar(@UsuarioLogado Long clienteId,
			@RequestParam(required = false) List<StatusPedido> status,
			@RequestParam(defaultValue = "1") int pagina,
			@RequestParam(defaultValue = "5") int tamanho) {
		return pedidoService.listar(clienteId, status, pagina, tamanho);
	}

	@GetMapping("/resumo")
	public ResumoPedidosResponse resumo(@UsuarioLogado Long clienteId) {
		return pedidoService.resumo(clienteId);
	}

	@GetMapping("/{id}")
	public PedidoResponse buscar(@UsuarioLogado Long clienteId, @PathVariable Long id) {
		return pedidoService.buscar(clienteId, id);
	}

	@PostMapping
	public ResponseEntity<PedidoResponse> criar(@UsuarioLogado Long clienteId, @RequestBody @Valid PedidoRequest req) {
		PedidoResponse criado = pedidoService.criar(clienteId, req);
		return ResponseEntity.created(URI.create("/api/pedidos/" + criado.id())).body(criado);
	}

	@PutMapping("/{id}")
	public PedidoResponse editar(@UsuarioLogado Long clienteId, @PathVariable Long id,
			@RequestBody @Valid PedidoEdicaoRequest req) {
		return pedidoService.editar(clienteId, id, req);
	}

	@PostMapping("/{id}/financiamento")
	public PedidoResponse escolherFinanciamento(@UsuarioLogado Long clienteId, @PathVariable Long id,
			@RequestBody @Valid FinanciamentoRequest req) {
		return pedidoService.escolherFinanciamento(clienteId, id, req.bancoId());
	}

	@PostMapping("/{id}/financiamento/desistencia")
	public PedidoResponse desistirDoFinanciamento(@UsuarioLogado Long clienteId, @PathVariable Long id) {
		return pedidoService.desistirDoFinanciamento(clienteId, id);
	}

	@PostMapping("/{id}/cancelamento")
	public PedidoResponse cancelar(@UsuarioLogado Long clienteId, @PathVariable Long id) {
		return pedidoService.cancelar(clienteId, id);
	}
}
