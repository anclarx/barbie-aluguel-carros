package br.pucminas.pinkgo.dto;

import br.pucminas.pinkgo.entity.TipoContrato;
import jakarta.validation.constraints.Size;

public record ParecerRequest(@Size(max = 500, message = "Use no máximo 500 caracteres.") String justificativa,
		TipoContrato tipoContrato) {
}
