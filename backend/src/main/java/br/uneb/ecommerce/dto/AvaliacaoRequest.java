package br.uneb.ecommerce.dto;

import jakarta.validation.constraints.*;

public record AvaliacaoRequest(
        @NotNull(message = "O cliente é obrigatório.")
        @Positive(message = "Cliente inválido.")
        Long clienteId,

        @NotNull(message = "A nota é obrigatória.")
        @Min(value = 1, message = "A nota mínima é 1.")
        @Max(value = 5, message = "A nota máxima é 5.")
        Integer nota,

        @Size(max = 500, message = "O comentário deve ter no máximo 500 caracteres.")
        String comentario
) {}
