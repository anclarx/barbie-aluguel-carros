package br.pucminas.pinkgo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.pucminas.pinkgo.dto.AgenteResponse;
import br.pucminas.pinkgo.dto.PaginaResponse;
import br.pucminas.pinkgo.dto.ParecerRequest;
import br.pucminas.pinkgo.dto.PedidoAgenteResponse;
import br.pucminas.pinkgo.dto.ResumoPedidosResponse;
import br.pucminas.pinkgo.entity.StatusPedido;
import br.pucminas.pinkgo.security.UsuarioLogado;
import br.pucminas.pinkgo.service.AgenteService;
import jakarta.validation.Valid;

/**
 * Painel do agente da PinkGo: pedidos recebidos, parecer da análise financeira (com justificativa opcional) e
 * contrato.
 */
@RestController
@RequestMapping("/api/agentes")
public class AgenteController {

	private final AgenteService agenteService;

	public AgenteController(AgenteService agenteService) {
		this.agenteService = agenteService;
	}

	@GetMapping("/me")
	public AgenteResponse eu(@UsuarioLogado Long agenteId) {
		return agenteService.buscar(agenteId);
	}

	@GetMapping("/pedidos")
	public PaginaResponse<PedidoAgenteResponse> pedidos(@UsuarioLogado Long agenteId,
			@RequestParam(required = false) List<StatusPedido> status,
			@RequestParam(defaultValue = "1") int pagina,
			@RequestParam(defaultValue = "5") int tamanho) {
		return agenteService.listarPedidos(agenteId, status, pagina, tamanho);
	}

	@GetMapping("/pedidos/resumo")
	public ResumoPedidosResponse resumo(@UsuarioLogado Long agenteId) {
		return agenteService.resumo(agenteId);
	}

	@PostMapping("/pedidos/{id}/aprovacao")
	public PedidoAgenteResponse aprovar(@PathVariable Long id, @RequestBody(required = false) @Valid ParecerRequest req) {
		return req == null ? agenteService.aprovar(id, null, null)
				: agenteService.aprovar(id, req.justificativa(), req.tipoContrato());
	}

	@PostMapping("/pedidos/{id}/negacao")
	public PedidoAgenteResponse negar(@PathVariable Long id, @RequestBody(required = false) @Valid ParecerRequest req) {
		return agenteService.negar(id, req == null ? null : req.justificativa());
	}

	@PostMapping("/pedidos/{id}/inicio-contrato")
	public PedidoAgenteResponse iniciarContrato(@PathVariable Long id) {
		return agenteService.iniciarContrato(id);
	}

	@PostMapping("/pedidos/{id}/encerramento")
	public PedidoAgenteResponse encerrarContrato(@PathVariable Long id) {
		return agenteService.encerrarContrato(id);
	}
}
