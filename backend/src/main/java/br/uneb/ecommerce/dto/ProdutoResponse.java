package br.uneb.ecommerce.dto;

import br.uneb.ecommerce.model.Produto;

import java.math.BigDecimal;

public record ProdutoResponse(
        Long id,
        String nome,
        String descricao,
        BigDecimal preco,
        Integer estoque,
        String imagemUrl,
        Boolean ativo,
        Long categoriaId,
        String categoriaNome
) {
    public static ProdutoResponse from(Produto p) {
        return new ProdutoResponse(p.getId(), p.getNome(), p.getDescricao(), p.getPreco(),
                p.getEstoque(), p.getImagemUrl(), p.getAtivo(),
                p.getCategoria().getId(), p.getCategoria().getNome());
    }
}
