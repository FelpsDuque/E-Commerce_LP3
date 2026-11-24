package br.uneb.ecommerce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

/** RF05 - Finalização do pedido a partir do carrinho. */
public record PedidoRequest(
        @NotNull(message = "O cliente é obrigatório.")
        @Positive(message = "Cliente inválido.")
        Long clienteId,

        @NotEmpty(message = "O carrinho está vazio.")
        @Size(max = 50, message = "O pedido pode ter no máximo 50 itens.")
        List<@Valid @NotNull ItemPedidoRequest> itens,

        @Size(max = 30, message = "Código de cupom inválido.")
        String codigoCupom
) {}
