package br.uneb.ecommerce.dto;

import br.uneb.ecommerce.model.Pedido;
import br.uneb.ecommerce.model.StatusPedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
        Long id,
        Long clienteId,
        String clienteNome,
        LocalDateTime dataPedido,
        StatusPedido status,
        BigDecimal subtotal,
        BigDecimal desconto,
        BigDecimal total,
        String codigoCupom,
        List<ItemPedidoResponse> itens
) {
    public static PedidoResponse from(Pedido p) {
        return new PedidoResponse(p.getId(), p.getCliente().getId(), p.getCliente().getNome(),
                p.getDataPedido(), p.getStatus(), p.getSubtotal(), p.getDesconto(), p.getTotal(),
                p.getCupom() != null ? p.getCupom().getCodigo() : null,
                p.getItens().stream().map(ItemPedidoResponse::from).toList());
    }
}
