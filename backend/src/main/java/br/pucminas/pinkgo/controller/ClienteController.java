package br.pucminas.pinkgo.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.pucminas.pinkgo.dto.ClienteAtualizacaoRequest;
import br.pucminas.pinkgo.dto.ClienteCadastroRequest;
import br.pucminas.pinkgo.dto.ClienteResponse;
import br.pucminas.pinkgo.dto.VerificacaoCadastroRequest;
import br.pucminas.pinkgo.security.UsuarioLogado;
import br.pucminas.pinkgo.service.ClienteService;
import jakarta.validation.Valid;

/** O cadastro é público; o perfil (`/me`) é sempre o do cliente do token. */
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

	private final ClienteService clienteService;

	public ClienteController(ClienteService clienteService) {
		this.clienteService = clienteService;
	}

	@PostMapping
	public ResponseEntity<ClienteResponse> cadastrar(@RequestBody @Valid ClienteCadastroRequest req) {
		ClienteResponse criado = clienteService.cadastrar(req);
		return ResponseEntity.created(URI.create("/api/clientes/me")).body(criado);
	}

	/** Etapas do cadastro: 204 se e-mail, CPF e RG enviados estão livres; 409 com o campo repetido. */
	@PostMapping("/verificacao")
	public ResponseEntity<Void> verificar(@RequestBody VerificacaoCadastroRequest req) {
		clienteService.verificarCadastro(req);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/me")
	public ClienteResponse perfil(@UsuarioLogado Long clienteId) {
		return clienteService.buscar(clienteId);
	}

	@PutMapping("/me")
	public ClienteResponse atualizar(@UsuarioLogado Long clienteId, @RequestBody @Valid ClienteAtualizacaoRequest req) {
		return clienteService.atualizar(clienteId, req);
	}

	@DeleteMapping("/me")
	public ResponseEntity<Void> excluir(@UsuarioLogado Long clienteId) {
		clienteService.excluir(clienteId);
		return ResponseEntity.noContent().build();
	}
}
