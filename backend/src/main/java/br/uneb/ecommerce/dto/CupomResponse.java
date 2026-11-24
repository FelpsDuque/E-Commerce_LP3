package br.uneb.ecommerce.dto;

import br.uneb.ecommerce.model.Cupom;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CupomResponse(Long id, String codigo, BigDecimal percentual, LocalDate validade,
                            Boolean ativo, boolean valido) {

    public static CupomResponse from(Cupom c) {
        return new CupomResponse(c.getId(), c.getCodigo(), c.getPercentual(), c.getValidade(),
                c.getAtivo(), c.isValidoEm(LocalDate.now()));
    }
}
