package br.pucminas.pinkgo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.pucminas.pinkgo.dto.EsqueciSenhaRequest;
import br.pucminas.pinkgo.dto.LoginRequest;
import br.pucminas.pinkgo.dto.LoginResponse;
import br.pucminas.pinkgo.dto.RedefinirSenhaRequest;
import br.pucminas.pinkgo.service.AuthService;
import br.pucminas.pinkgo.service.RedefinicaoSenhaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final RedefinicaoSenhaService redefinicaoSenhaService;

	public AuthController(AuthService authService, RedefinicaoSenhaService redefinicaoSenhaService) {
		this.authService = authService;
		this.redefinicaoSenhaService = redefinicaoSenhaService;
	}

	@PostMapping("/login")
	public LoginResponse login(@RequestBody @Valid LoginRequest req) {
		return authService.login(req);
	}

	/** Sempre 202, exista ou não a conta. */
	@PostMapping("/esqueci-senha")
	public ResponseEntity<Void> esqueciSenha(@RequestBody @Valid EsqueciSenhaRequest req) {
		redefinicaoSenhaService.solicitar(req.email());
		return ResponseEntity.accepted().build();
	}

	@PostMapping("/redefinir-senha")
	public ResponseEntity<Void> redefinirSenha(@RequestBody @Valid RedefinirSenhaRequest req) {
		redefinicaoSenhaService.redefinir(req.token(), req.novaSenha());
		return ResponseEntity.noContent().build();
	}
}
