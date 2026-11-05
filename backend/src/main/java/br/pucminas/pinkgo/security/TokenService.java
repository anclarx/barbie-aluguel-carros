package br.pucminas.pinkgo.security;

import java.time.Clock;
import java.time.Instant;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

	public record Token(String valor, Instant expiraEm) {
	}

	private static final String EMISSOR = "pinkgo";
	public static final String CLAIM_PAPEL = "papel";

	private final JwtEncoder encoder;
	private final JwtProperties propriedades;
	private final Clock clock;

	public TokenService(JwtEncoder encoder, JwtProperties propriedades, Clock clock) {
		this.encoder = encoder;
		this.propriedades = propriedades;
		this.clock = clock;
	}

	public Token emitir(Long id, String nome, Papel papel) {
		Instant agora = clock.instant();
		Instant expiraEm = agora.plus(propriedades.expiracao());
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer(EMISSOR)
				.subject(id.toString())
				.issuedAt(agora)
				.expiresAt(expiraEm)
				.claim("nome", nome)
				.claim(CLAIM_PAPEL, papel.name())
				.build();
		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		return new Token(encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue(), expiraEm);
	}
}
