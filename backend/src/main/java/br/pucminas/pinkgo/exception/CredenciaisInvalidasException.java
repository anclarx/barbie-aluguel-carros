package br.pucminas.pinkgo.exception;

public class CredenciaisInvalidasException extends RuntimeException {

	public CredenciaisInvalidasException() {
		super("E-mail ou senha incorretos.");
	}
}
