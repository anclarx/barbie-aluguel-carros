package br.pucminas.pinkgo.dto;

import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.servlet.resource.ResourceUrlProvider;
import org.springframework.web.servlet.resource.ResourceUrlProviderExposingInterceptor;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.pucminas.pinkgo.config.ImagensConfig;

/** Monta a URL pública de uma imagem guardada no banco como caminho relativo (ex.: `carros/sunset-gt.png`). */
final class Imagens {

	private Imagens() {
	}

	static String url(String caminho) {
		// Bancos criados antes da mudança guardam o caminho antigo do front ("/images/carros/...").
		String relativo = caminho.replaceFirst("^/?images/", "").replaceFirst("^/", "");
		String caminhoApi = ImagensConfig.CAMINHO + relativo;
		// Dentro de uma requisição, a URL sai completa, com o endereço da API; fora dela (testes de serviço), relativa.
		RequestAttributes atributos = RequestContextHolder.getRequestAttributes();
		if (atributos == null) return caminhoApi;
		return ServletUriComponentsBuilder.fromCurrentContextPath().path(comVersao(caminhoApi, atributos))
				.toUriString();
	}

	/**
	 * Põe o hash do conteúdo no nome do arquivo (ex.: `sunset-gt-pink-3f2a….png`, veja ImagensConfig): quando a foto
	 * muda, a URL muda junto e o navegador não fica preso à cópia antiga do cache.
	 */
	private static String comVersao(String caminhoApi, RequestAttributes atributos) {
		Object provedor = atributos.getAttribute(ResourceUrlProviderExposingInterceptor.RESOURCE_URL_PROVIDER_ATTR,
				RequestAttributes.SCOPE_REQUEST);
		if (!(provedor instanceof ResourceUrlProvider urls)) return caminhoApi;
		String versionado = urls.getForLookupPath(caminhoApi);
		return versionado != null ? versionado : caminhoApi;
	}
}
