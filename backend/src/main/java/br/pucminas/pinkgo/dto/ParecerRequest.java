package br.pucminas.pinkgo.dto;

import br.pucminas.pinkgo.entity.TipoContrato;
import jakarta.validation.constraints.Size;

/**
 * Parecer do agente: a justificativa (opcional) e, na aprovação, em nome de quem o automóvel fica durante o contrato.
 * Sem `tipoContrato`, vale a sugestão do pedido (do banco com financiamento, da empresa sem).
 */
public record ParecerRequest(@Size(max = 500, message = "Use no máximo 500 caracteres.") String justificativa,
		TipoContrato tipoContrato) {
}
