package br.uneb.ecommerce.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/** RF08 - Cupom de desconto percentual com data de validade. */
@Entity
@Table(name = "cupom")
@Getter
@Setter
@NoArgsConstructor
public class Cupom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30, unique = true)
    private String codigo;

    /** Percentual de 1 a 90 */
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentual;

    @Column(nullable = false)
    private LocalDate validade;

    @Column(nullable = false)
    private Boolean ativo = true;

    public Cupom(String codigo, BigDecimal percentual, LocalDate validade) {
        this.codigo = codigo;
        this.percentual = percentual;
        this.validade = validade;
        this.ativo = true;
    }

    public boolean isValidoEm(LocalDate data) {
        return Boolean.TRUE.equals(ativo) && !data.isAfter(validade);
    }
}
