package br.pucminas.pinkgo.config;

import java.time.Duration;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.VersionResourceResolver;

@Configuration
public class ImagensConfig implements WebMvcConfigurer {

	public static final String CAMINHO = "/api/imagens/";

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler(CAMINHO + "**")
				.addResourceLocations("classpath:/imagens/")
				.setCacheControl(CacheControl.maxAge(Duration.ofDays(7)).cachePublic())
				.resourceChain(true)
				.addResolver(new VersionResourceResolver().addContentVersionStrategy("/**"));
	}
}
