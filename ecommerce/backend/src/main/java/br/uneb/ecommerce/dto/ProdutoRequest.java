package br.uneb.ecommerce.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProdutoRequest(
        @NotBlank(message = "O nome é obrigatório.")
        @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres.")
        String nome,

        @Size(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres.")
        String descricao,

        // RN04 - preço maior que zero
        @NotNull(message = "O preço é obrigatório.")
        @Positive(message = "O preço deve ser maior que zero.")
        @Digits(integer = 10, fraction = 2, message = "O preço deve ter no máximo 2 casas decimais.")
        BigDecimal preco,

        // RN04 - estoque maior ou igual a zero
        @NotNull(message = "O estoque é obrigatório.")
        @PositiveOrZero(message = "O estoque não pode ser negativo.")
        @Max(value = 100000, message = "O estoque deve ser no máximo 100000.")
        Integer estoque,

        @Size(max = 500, message = "A URL da imagem deve ter no máximo 500 caracteres.")
        @Pattern(regexp = "^$|^https?://.+", message = "A imagem deve ser uma URL iniciada por http:// ou https://.")
        String imagemUrl,

        @NotNull(message = "A categoria é obrigatória.")
        @Positive(message = "Categoria inválida.")
        Long categoriaId,

        /** Opcional: permite reativar um produto inativado. */
        Boolean ativo
) {}
