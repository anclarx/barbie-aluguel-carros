package br.pucminas.pinkgo.config;

import java.util.Properties;
import java.util.concurrent.Executors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import br.pucminas.pinkgo.service.EmailNotificacaoService;
import br.pucminas.pinkgo.service.LogNotificacaoService;
import br.pucminas.pinkgo.service.NotificacaoService;

@Configuration
public class NotificacaoConfig {

	private static final Logger log = LoggerFactory.getLogger(NotificacaoConfig.class);
	private static final String TEMPO_LIMITE_MS = "10000";

	@Bean
	NotificacaoService notificacaoService(EmailProperties email) {
		if (!email.configurado()) {
			log.info("MAIL_HOST não configurado: os links de redefinição de senha vão só para o log.");
			return new LogNotificacaoService();
		}
		JavaMailSenderImpl sender = new JavaMailSenderImpl();
		sender.setHost(email.host());
		sender.setPort(email.port());
		sender.setUsername(email.usuario());
		sender.setPassword(email.senha());
		sender.setDefaultEncoding("UTF-8");
		Properties smtp = sender.getJavaMailProperties();
		smtp.put("mail.smtp.auth", "true");
		if (email.port() == 465) smtp.put("mail.smtp.ssl.enable", "true");
		else smtp.put("mail.smtp.starttls.enable", "true");
		smtp.put("mail.smtp.connectiontimeout", TEMPO_LIMITE_MS);
		smtp.put("mail.smtp.timeout", TEMPO_LIMITE_MS);
		smtp.put("mail.smtp.writetimeout", TEMPO_LIMITE_MS);
		log.info("E-mails de redefinição de senha saem por {} como {}.", email.host(), email.remetente());
		return new EmailNotificacaoService(sender, email.remetente(), Executors.newVirtualThreadPerTaskExecutor());
	}
}
