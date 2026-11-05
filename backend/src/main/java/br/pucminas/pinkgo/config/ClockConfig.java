package br.pucminas.pinkgo.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** "Hoje" no fuso de Brasília, injetável para os testes poderem fixar a data. */
@Configuration
public class ClockConfig {

	public static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

	@Bean
	Clock clock() {
		return Clock.system(FUSO);
	}
}
