package br.uneb.ecommerce.dto;

import br.uneb.ecommerce.model.ItemPedido;

import java.math.BigDecimal;

public record ItemPedidoResponse(Long id, Long produtoId, String produtoNome, String imagemUrl,
                                 Integer quantidade, BigDecimal precoUnitario, BigDecimal subtotal) {

    public static ItemPedidoResponse from(ItemPedido i) {
        return new ItemPedidoResponse(i.getId(), i.getProduto().getId(), i.getProduto().getNome(),
                i.getProduto().getImagemUrl(), i.getQuantidade(), i.getPrecoUnitario(), i.getSubtotal());
    }
}
