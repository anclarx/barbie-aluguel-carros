package br.pucminas.pinkgo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.pucminas.pinkgo.dto.EnderecoSugestao;
import br.pucminas.pinkgo.service.EnderecoService;

/** Sugestões de endereço residencial para o cadastro (público, porque o cadastro acontece antes do login). */
@RestController
@RequestMapping("/api/enderecos")
public class EnderecoController {

	private final EnderecoService enderecoService;

	public EnderecoController(EnderecoService enderecoService) {
		this.enderecoService = enderecoService;
	}

	@GetMapping
	public List<EnderecoSugestao> buscar(@RequestParam(defaultValue = "") String busca) {
		return enderecoService.buscar(busca);
	}
}
