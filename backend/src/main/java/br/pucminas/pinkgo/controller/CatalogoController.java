package br.pucminas.pinkgo.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.pucminas.pinkgo.dto.BancoResponse;
import br.pucminas.pinkgo.dto.LocalResponse;
import br.pucminas.pinkgo.dto.ModeloResponse;
import br.pucminas.pinkgo.dto.TipoRendimentoResponse;
import br.pucminas.pinkgo.service.CatalogoService;

@RestController
@RequestMapping("/api")
public class CatalogoController {

	private final CatalogoService catalogoService;

	public CatalogoController(CatalogoService catalogoService) {
		this.catalogoService = catalogoService;
	}

	@GetMapping("/modelos")
	public List<ModeloResponse> modelos(@RequestParam(required = false) Long localId,
			@RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate retirada,
			@RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate entrega) {
		return catalogoService.listarModelos(localId, retirada, entrega);
	}

	@GetMapping("/modelos/{id}")
	public ModeloResponse modelo(@PathVariable Long id) {
		return catalogoService.buscarModelo(id);
	}

	@GetMapping("/modelos/{id}/locais")
	public List<LocalResponse> locaisDoModelo(@PathVariable Long id,
			@RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate retirada,
			@RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate entrega) {
		return catalogoService.listarLocaisDoModelo(id, retirada, entrega);
	}

	@GetMapping("/locais")
	public List<LocalResponse> locais() {
		return catalogoService.listarLocais();
	}

	@GetMapping("/bancos")
	public List<BancoResponse> bancos() {
		return catalogoService.listarBancos();
	}

	@GetMapping("/tipos-rendimento")
	public List<TipoRendimentoResponse> tiposRendimento() {
		return catalogoService.listarTiposRendimento();
	}
}
