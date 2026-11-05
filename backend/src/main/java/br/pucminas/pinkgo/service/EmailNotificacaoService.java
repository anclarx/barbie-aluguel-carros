package br.pucminas.pinkgo.service;

import java.io.UnsupportedEncodingException;
import java.util.concurrent.Executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.util.HtmlUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

/** Envia as mensagens por e-mail (SMTP), com versão em HTML e em texto simples. */
public class EmailNotificacaoService implements NotificacaoService {

	private static final Logger log = LoggerFactory.getLogger(EmailNotificacaoService.class);

	private final JavaMailSender sender;
	private final String remetente;
	private final Executor executor;

	public EmailNotificacaoService(JavaMailSender sender, String remetente, Executor executor) {
		this.sender = sender;
		this.remetente = remetente;
		this.executor = executor;
	}

	@Override
	public void enviarLinkRedefinicaoSenha(String email, String nome, String link) {
		executor.execute(() -> enviar(email, nome, link));
	}

	private void enviar(String email, String nome, String link) {
		try {
			MimeMessage mensagem = sender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(mensagem, true, "UTF-8");
			helper.setFrom(remetente());
			helper.setTo(email);
			helper.setSubject("Redefina sua senha da PinkGo");
			helper.setText(texto(nome, link), html(nome, link));
			sender.send(mensagem);
			log.info("E-mail de redefinição de senha enviado para {}.", email);
		} catch (MessagingException | MailException | UnsupportedEncodingException e) {
			// A tela já respondeu "enviamos o link" (não pode revelar se a conta existe): o erro fica no log.
			log.error("Não foi possível enviar o e-mail de redefinição de senha para {}: {}", email, e.getMessage(), e);
		}
	}

	/**
	 * O MAIL_FROM pode vir só com o endereço ("pinkgo@gmail.com") ou com nome ("PinkGo <pinkgo@gmail.com>"). Sem nome,
	 * o remetente aparece como "PinkGo".
	 */
	private InternetAddress remetente() throws AddressException, UnsupportedEncodingException {
		InternetAddress endereco = new InternetAddress(remetente.trim(), true);
		if (endereco.getPersonal() == null || endereco.getPersonal().isBlank()) endereco.setPersonal("PinkGo", "UTF-8");
		return endereco;
	}

	private static String primeiroNome(String nome) {
		return nome == null || nome.isBlank() ? "" : nome.trim().split("\\s+")[0];
	}

	static String texto(String nome, String link) {
		return """
				Olá, %s!

				Recebemos um pedido para redefinir a senha da sua conta PinkGo.
				Crie uma nova senha neste link (vale por %d minutos e funciona uma vez só):

				%s

				Se não foi você, ignore este e-mail: sua senha continua a mesma.
				""".formatted(primeiroNome(nome), RedefinicaoSenhaService.VALIDADE.toMinutes(), link);
	}

	/** HTML com tabelas e estilos inline: o formato que os clientes de e-mail (Gmail, Outlook) entendem. */
	static String html(String nome, String link) {
		String nomeSeguro = HtmlUtils.htmlEscape(primeiroNome(nome));
		String linkSeguro = HtmlUtils.htmlEscape(link);
		return """
				<!DOCTYPE html>
				<html lang="pt-BR">
				<body style="margin:0;padding:0;background:#f7f7f7;font-family:Quicksand,Arial,sans-serif;color:#1a1a1a;">
				  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:32px 16px;">
				    <tr><td align="center">
				      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0"
				             style="max-width:520px;background:#ffffff;border:1px solid #e2c8d8;border-radius:12px;">
				        <tr><td style="padding:32px 32px 0;">
				          <p style="margin:0;font-size:28px;font-weight:700;color:#ff3eb5;">PinkGo</p>
				        </td></tr>
				        <tr><td style="padding:24px 32px 0;">
				          <h1 style="margin:0 0 12px;font-size:20px;">Olá, %s!</h1>
				          <p style="margin:0 0 8px;font-size:16px;line-height:1.5;">
				            Recebemos um pedido para redefinir a senha da sua conta PinkGo.
				          </p>
				          <p style="margin:0;font-size:16px;line-height:1.5;">
				            O link vale por %d minutos e funciona uma vez só.
				          </p>
				        </td></tr>
				        <tr><td align="center" style="padding:28px 32px;">
				          <a href="%s" style="display:inline-block;background:#ff3eb5;color:#ffffff;text-decoration:none;
				             font-weight:700;font-size:16px;padding:14px 32px;border-radius:60px;">Criar nova senha</a>
				        </td></tr>
				        <tr><td style="padding:0 32px 32px;font-size:14px;line-height:1.5;color:#757575;">
				          <p style="margin:0 0 8px;">Se o botão não funcionar, copie e cole este endereço no navegador:</p>
				          <p style="margin:0 0 16px;word-break:break-all;"><a href="%s" style="color:#ff3eb5;">%s</a></p>
				          <p style="margin:0;">Se não foi você, ignore este e-mail: sua senha continua a mesma.</p>
				        </td></tr>
				      </table>
				    </td></tr>
				  </table>
				</body>
				</html>
				""".formatted(nomeSeguro, RedefinicaoSenhaService.VALIDADE.toMinutes(), linkSeguro, linkSeguro,
				linkSeguro);
	}
}
