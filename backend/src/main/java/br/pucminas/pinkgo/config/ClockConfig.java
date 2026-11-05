package br.pucminas.pinkgo.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ClockConfig {

	public static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

	@Bean
	Clock clock() {
		return Clock.system(FUSO);
	}
}
