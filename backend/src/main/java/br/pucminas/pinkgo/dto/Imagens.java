package br.pucminas.pinkgo.dto;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.pucminas.pinkgo.config.ImagensConfig;

/** Monta a URL pública de uma imagem guardada no banco como caminho relativo (ex.: `carros/sunset-gt.png`). */
final class Imagens {

	private Imagens() {
	}

	static String url(String caminho) {
		// Bancos criados antes da mudança guardam o caminho antigo do front ("/images/carros/...").
		String relativo = caminho.replaceFirst("^/?images/", "").replaceFirst("^/", "");
		// Dentro de uma requisição, a URL sai completa, com o endereço da API; fora dela (testes de serviço), relativa.
		if (RequestContextHolder.getRequestAttributes() == null) return ImagensConfig.CAMINHO + relativo;
		return ServletUriComponentsBuilder.fromCurrentContextPath().path(ImagensConfig.CAMINHO).path(relativo)
				.toUriString();
	}
}
