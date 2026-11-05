package br.pucminas.pinkgo.dto;

import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.servlet.resource.ResourceUrlProvider;
import org.springframework.web.servlet.resource.ResourceUrlProviderExposingInterceptor;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import br.pucminas.pinkgo.config.ImagensConfig;

final class Imagens {

	private Imagens() {
	}

	static String url(String caminho) {
		String relativo = caminho.replaceFirst("^/?images/", "").replaceFirst("^/", "");
		String caminhoApi = ImagensConfig.CAMINHO + relativo;
		RequestAttributes atributos = RequestContextHolder.getRequestAttributes();
		if (atributos == null) return caminhoApi;
		return ServletUriComponentsBuilder.fromCurrentContextPath().path(comVersao(caminhoApi, atributos))
				.toUriString();
	}

	private static String comVersao(String caminhoApi, RequestAttributes atributos) {
		Object provedor = atributos.getAttribute(ResourceUrlProviderExposingInterceptor.RESOURCE_URL_PROVIDER_ATTR,
				RequestAttributes.SCOPE_REQUEST);
		if (!(provedor instanceof ResourceUrlProvider urls)) return caminhoApi;
		String versionado = urls.getForLookupPath(caminhoApi);
		return versionado != null ? versionado : caminhoApi;
	}
}
