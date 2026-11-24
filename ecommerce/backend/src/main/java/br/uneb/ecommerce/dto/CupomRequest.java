package br.uneb.ecommerce.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CupomRequest(
        @NotBlank(message = "O código é obrigatório.")
        @Pattern(regexp = "^[A-Z0-9]{3,30}$", message = "O código deve ter de 3 a 30 letras maiúsculas ou números.")
        String codigo,

        @NotNull(message = "O percentual é obrigatório.")
        @DecimalMin(value = "1", message = "O percentual mínimo é 1%.")
        @DecimalMax(value = "90", message = "O percentual máximo é 90%.")
        @Digits(integer = 2, fraction = 2, message = "Percentual inválido.")
        BigDecimal percentual,

        @NotNull(message = "A data de validade é obrigatória.")
        LocalDate validade,

        Boolean ativo
) {}
