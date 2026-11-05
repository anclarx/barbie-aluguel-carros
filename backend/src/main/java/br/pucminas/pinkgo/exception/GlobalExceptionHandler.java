package br.pucminas.pinkgo.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Erros da API no formato RFC 9457 (ProblemDetail). Erros ligados a campos vêm em `erros`
 * ({"cpf": "CPF inválido."}), para o front mostrar a mensagem embaixo de cada campo.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	ProblemDetail validacao(MethodArgumentNotValidException ex) {
		Map<String, String> erros = new LinkedHashMap<>();
		// `rendimentos[0].valorMensal` vira `rendimentos`: o front mostra um aviso só para a lista.
		ex.getBindingResult().getFieldErrors()
				.forEach(e -> erros.putIfAbsent(e.getField().replaceAll("\\[.*", ""), e.getDefaultMessage()));
		return problema(HttpStatus.BAD_REQUEST, "Confira os campos destacados.", erros);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	ProblemDetail corpoInvalido() {
		return problema(HttpStatus.BAD_REQUEST, "Requisição em formato inválido.", Map.of());
	}

	@ExceptionHandler(ConflitoException.class)
	ProblemDetail conflito(ConflitoException ex) {
		return problema(HttpStatus.CONFLICT, ex.getMessage(), campo(ex));
	}

	@ExceptionHandler(RegraDeNegocioException.class)
	ProblemDetail regra(RegraDeNegocioException ex) {
		return problema(HttpStatus.UNPROCESSABLE_CONTENT, ex.getMessage(), campo(ex));
	}

	@ExceptionHandler(RecursoNaoEncontradoException.class)
	ProblemDetail naoEncontrado(RecursoNaoEncontradoException ex) {
		return problema(HttpStatus.NOT_FOUND, ex.getMessage(), Map.of());
	}

	@ExceptionHandler(ServicoIndisponivelException.class)
	ProblemDetail indisponivel(ServicoIndisponivelException ex) {
		return problema(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage(), Map.of());
	}

	@ExceptionHandler(CredenciaisInvalidasException.class)
	ProblemDetail credenciais(CredenciaisInvalidasException ex) {
		return problema(HttpStatus.UNAUTHORIZED, ex.getMessage(), Map.of());
	}

	private static Map<String, String> campo(RegraDeNegocioException ex) {
		return ex.getCampo() == null ? Map.of() : Map.of(ex.getCampo(), ex.getMessage());
	}

	private static ProblemDetail problema(HttpStatus status, String mensagem, Map<String, String> erros) {
		ProblemDetail problema = ProblemDetail.forStatusAndDetail(status, mensagem);
		if (!erros.isEmpty()) problema.setProperty("erros", erros);
		return problema;
	}
}
