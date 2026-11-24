package br.uneb.ecommerce.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/** Produto N:1 Categoria, Produto 1:N ItemPedido, Produto 1:N Avaliacao */
@Entity
@Table(name = "produto")
@Getter
@Setter
@NoArgsConstructor
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 1000)
    private String descricao;

    /** RNF10 - valores monetários em BigDecimal */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal preco;

    @Column(nullable = false)
    private Integer estoque;

    @Column(length = 500)
    private String imagemUrl;

    /** RN04 - produto que já foi vendido é inativado em vez de excluído. */
    @Column(nullable = false)
    private Boolean ativo = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @OneToMany(mappedBy = "produto")
    private List<ItemPedido> itens = new ArrayList<>();

    @OneToMany(mappedBy = "produto", cascade = CascadeType.REMOVE)
    private List<Avaliacao> avaliacoes = new ArrayList<>();

    /** Controle de concorrência otimista: evita duas compras simultâneas venderem o mesmo estoque. */
    @Version
    private Long versao;

    public Produto(String nome, String descricao, BigDecimal preco, Integer estoque,
                   String imagemUrl, Categoria categoria) {
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.estoque = estoque;
        this.imagemUrl = imagemUrl;
        this.categoria = categoria;
        this.ativo = true;
    }

    public void baixarEstoque(int quantidade) {
        this.estoque -= quantidade;
    }

    public void devolverEstoque(int quantidade) {
        this.estoque += quantidade;
    }
}
