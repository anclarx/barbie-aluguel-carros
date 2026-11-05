package br.pucminas.pinkgo.dto;

import java.util.List;
import java.util.function.Function;

import org.springframework.data.domain.Page;

public record PaginaResponse<T>(List<T> itens, int pagina, int tamanho, long total, int totalPaginas) {

	public static <E, T> PaginaResponse<T> de(Page<E> page, Function<E, T> mapear) {
		return new PaginaResponse<>(page.map(mapear).getContent(), page.getNumber() + 1, page.getSize(),
				page.getTotalElements(), page.getTotalPages());
	}
}
