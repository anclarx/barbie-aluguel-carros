package br.pucminas.pinkgo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

@ExtendWith(MockitoExtension.class)
class EmailNotificacaoServiceTest {

	private static final String LINK = "http://localhost:5173/redefinir-senha?token=abc123";

	@Mock
	JavaMailSender sender;

	EmailNotificacaoService service;

	@BeforeEach
	void setUp() {
		// lenient: o teste do HTML não chega a montar a mensagem.
		lenient().when(sender.createMimeMessage()).thenReturn(new MimeMessage((Session) null));
		// Executor que roda na hora, para o teste ver o envio sem esperar outra thread.
		service = new EmailNotificacaoService(sender, "pinkgo@exemplo.com", Runnable::run);
	}

	@Test
	void enviaParaOClienteComOLinkEONome() throws Exception {
		service.enviarLinkRedefinicaoSenha("ana@exemplo.com", "Ana Clara <b>", LINK);

		ArgumentCaptor<MimeMessage> enviado = ArgumentCaptor.forClass(MimeMessage.class);
		verify(sender).send(enviado.capture());
		MimeMessage mensagem = enviado.getValue();
		assertThat(mensagem.getRecipients(Message.RecipientType.TO)[0].toString()).isEqualTo("ana@exemplo.com");
		assertThat(mensagem.getFrom()[0].toString()).contains("PinkGo").contains("pinkgo@exemplo.com");
		assertThat(mensagem.getSubject()).isEqualTo("Redefina sua senha da PinkGo");
	}

	@Test
	void aceitaRemetenteComNome() throws Exception {
		service = new EmailNotificacaoService(sender, "PinkGo Aluguéis <pinkgo@exemplo.com>", Runnable::run);
		service.enviarLinkRedefinicaoSenha("ana@exemplo.com", "Ana", LINK);

		ArgumentCaptor<MimeMessage> enviado = ArgumentCaptor.forClass(MimeMessage.class);
		verify(sender).send(enviado.capture());
		InternetAddress de = (InternetAddress) enviado.getValue().getFrom()[0];
		assertThat(de.getAddress()).isEqualTo("pinkgo@exemplo.com");
		assertThat(de.getPersonal()).isEqualTo("PinkGo Aluguéis");
	}

	@Test
	void htmlTemOLinkEEscapaONome() {
		String html = EmailNotificacaoService.html("<script>Ana", LINK);

		assertThat(html).contains("href=\"" + LINK + "\"").contains("30 minutos").contains("&lt;script&gt;Ana")
				.doesNotContain("<script>");
		assertThat(EmailNotificacaoService.texto("Ana Clara", LINK)).startsWith("Olá, Ana!").contains(LINK);
	}

	@Test
	void falhaNoSmtpNaoQuebraOPedidoDeRedefinicao() {
		doThrow(new MailSendException("SMTP fora do ar")).when(sender).send(any(MimeMessage.class));

		assertThatCode(() -> service.enviarLinkRedefinicaoSenha("ana@exemplo.com", "Ana", LINK))
				.doesNotThrowAnyException();
	}
}
