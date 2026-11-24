package br.uneb.ecommerce.dto;

import br.uneb.ecommerce.model.StatusPedido;
import jakarta.validation.constraints.NotNull;

/** RF07 - Alteração de status. Valores aceitos: PENDENTE, PAGO, ENVIADO, ENTREGUE, CANCELADO. */
public record StatusPedidoRequest(
        @NotNull(message = "O novo status é obrigatório.")
        StatusPedido status
) {}
