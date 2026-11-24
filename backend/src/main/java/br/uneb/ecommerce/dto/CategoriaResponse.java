package br.uneb.ecommerce.dto;

import br.uneb.ecommerce.model.Categoria;

public record CategoriaResponse(Long id, String nome, String descricao, long quantidadeProdutos) {

    public static CategoriaResponse from(Categoria c, long quantidadeProdutos) {
        return new CategoriaResponse(c.getId(), c.getNome(), c.getDescricao(), quantidadeProdutos);
    }
}
