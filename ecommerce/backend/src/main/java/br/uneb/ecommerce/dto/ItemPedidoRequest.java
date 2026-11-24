package br.uneb.ecommerce.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Um item do carrinho enviado na finalização. O preço NÃO vem do cliente (RNF27). */
public record ItemPedidoRequest(
        @NotNull(message = "O produto é obrigatório.")
        @Positive(message = "Produto inválido.")
        Long produtoId,

        @NotNull(message = "A quantidade é obrigatória.")
        @Min(value = 1, message = "A quantidade mínima é 1.")
        @Max(value = 999, message = "A quantidade máxima por item é 999.")
        Integer quantidade
) {}
