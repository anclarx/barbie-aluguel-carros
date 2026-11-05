package br.pucminas.pinkgo.service;

import java.util.Locale;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucminas.pinkgo.dto.AgenteResponse;
import br.pucminas.pinkgo.dto.ClienteResponse;
import br.pucminas.pinkgo.dto.LoginRequest;
import br.pucminas.pinkgo.dto.LoginResponse;
import br.pucminas.pinkgo.exception.CredenciaisInvalidasException;
import br.pucminas.pinkgo.repository.AgenteRepository;
import br.pucminas.pinkgo.repository.ClienteRepository;
import br.pucminas.pinkgo.security.Papel;
import br.pucminas.pinkgo.security.TokenService;

@Service
@Transactional(readOnly = true)
public class AuthService {

	private final ClienteRepository clienteRepository;
	private final AgenteRepository agenteRepository;
	private final PasswordEncoder passwordEncoder;
	private final TokenService tokenService;

	public AuthService(ClienteRepository clienteRepository, AgenteRepository agenteRepository,
			PasswordEncoder passwordEncoder, TokenService tokenService) {
		this.clienteRepository = clienteRepository;
		this.agenteRepository = agenteRepository;
		this.passwordEncoder = passwordEncoder;
		this.tokenService = tokenService;
	}

	public LoginResponse login(LoginRequest req) {
		String email = req.email().trim().toLowerCase(Locale.ROOT);
		return loginCliente(email, req.senha())
				.or(() -> loginAgente(email, req.senha()))
				.orElseThrow(CredenciaisInvalidasException::new);
	}

	private Optional<LoginResponse> loginCliente(String email, String senha) {
		return clienteRepository.findByEmailIgnoreCase(email)
				.filter(c -> passwordEncoder.matches(senha, c.getSenha()))
				.map(c -> {
					TokenService.Token token = tokenService.emitir(c.getId(), c.getNome(), Papel.CLIENTE);
					return new LoginResponse(token.valor(), token.expiraEm(), Papel.CLIENTE, ClienteResponse.de(c), null);
				});
	}

	private Optional<LoginResponse> loginAgente(String email, String senha) {
		return agenteRepository.findByEmailIgnoreCase(email)
				.filter(a -> passwordEncoder.matches(senha, a.getSenha()))
				.map(a -> {
					TokenService.Token token = tokenService.emitir(a.getId(), a.getNome(), a.papel());
					return new LoginResponse(token.valor(), token.expiraEm(), a.papel(), null, AgenteResponse.de(a));
				});
	}
}
