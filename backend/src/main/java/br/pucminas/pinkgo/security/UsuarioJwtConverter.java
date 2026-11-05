package br.pucminas.pinkgo.security;

import java.util.List;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import br.pucminas.pinkgo.repository.AgenteRepository;
import br.pucminas.pinkgo.repository.ClienteRepository;

@Component
public class UsuarioJwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {

	private final ClienteRepository clienteRepository;
	private final AgenteRepository agenteRepository;

	public UsuarioJwtConverter(ClienteRepository clienteRepository, AgenteRepository agenteRepository) {
		this.clienteRepository = clienteRepository;
		this.agenteRepository = agenteRepository;
	}

	@Override
	public AbstractAuthenticationToken convert(Jwt jwt) {
		Papel papel = papel(jwt);
		Long id = Long.valueOf(jwt.getSubject());
		boolean existe = papel == Papel.CLIENTE ? clienteRepository.existsById(id) : agenteRepository.existsById(id);
		if (!existe) throw new InvalidBearerTokenException("Sua sessão expirou. Entre de novo.");
		return new JwtAuthenticationToken(jwt, List.of(new SimpleGrantedAuthority(papel.role())), jwt.getSubject());
	}

	private static Papel papel(Jwt jwt) {
		String valor = jwt.getClaimAsString(TokenService.CLAIM_PAPEL);
		try {
			return valor == null ? Papel.CLIENTE : Papel.valueOf(valor);
		} catch (IllegalArgumentException e) {
			throw new InvalidBearerTokenException("Token inválido.");
		}
	}
}
