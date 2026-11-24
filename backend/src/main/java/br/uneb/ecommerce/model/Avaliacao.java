package br.uneb.ecommerce.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** RF09 - Avaliação de produto (nota 1 a 5 e comentário). Produto 1:N Avaliacao, Cliente 1:N Avaliacao */
@Entity
@Table(name = "avaliacao",
        uniqueConstraints = @UniqueConstraint(columnNames = {"produto_id", "cliente_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false)
    private Integer nota;

    @Column(length = 500)
    private String comentario;

    @Column(nullable = false)
    private LocalDateTime data;

    public Avaliacao(Produto produto, Cliente cliente, Integer nota, String comentario) {
        this.produto = produto;
        this.cliente = cliente;
        this.nota = nota;
        this.comentario = comentario;
        this.data = LocalDateTime.now();
    }
}
