package br.uneb.ecommerce.repository;

import br.uneb.ecommerce.model.ItemPedido;
import br.uneb.ecommerce.model.StatusPedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Long> {

    /** RN04 - verifica se o produto já consta em algum pedido. */
    boolean existsByProdutoId(Long produtoId);

    /** Usado na avaliação: o cliente comprou este produto (pedido não cancelado)? */
    boolean existsByProdutoIdAndPedidoClienteIdAndPedidoStatusNot(Long produtoId, Long clienteId,
                                                                   StatusPedido status);
}
