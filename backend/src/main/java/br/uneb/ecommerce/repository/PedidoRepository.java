package br.uneb.ecommerce.repository;

import br.uneb.ecommerce.dto.ProdutoMaisVendidoResponse;
import br.uneb.ecommerce.model.Pedido;
import br.uneb.ecommerce.model.StatusPedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @EntityGraph(attributePaths = {"cliente", "cupom"})
    @Query("""
            select p from Pedido p
            where (:clienteId is null or p.cliente.id = :clienteId)
              and (:status is null or p.status = :status)
            """)
    Page<Pedido> buscar(@Param("clienteId") Long clienteId,
                        @Param("status") StatusPedido status,
                        Pageable pageable);

    @EntityGraph(attributePaths = {"cliente", "cupom", "itens", "itens.produto"})
    Optional<Pedido> findComItensById(Long id);

    boolean existsByClienteId(Long clienteId);

    boolean existsByCupomId(Long cupomId);

    /** RF10 - produtos mais vendidos no período (ignora pedidos cancelados). */
    @Query("""
            select new br.uneb.ecommerce.dto.ProdutoMaisVendidoResponse(
                pr.id, pr.nome, c.nome, sum(i.quantidade), sum(i.subtotal))
            from ItemPedido i
              join i.pedido p
              join i.produto pr
              join pr.categoria c
            where p.status <> br.uneb.ecommerce.model.StatusPedido.CANCELADO
              and p.dataPedido >= :inicio and p.dataPedido < :fim
            group by pr.id, pr.nome, c.nome
            order by sum(i.quantidade) desc, sum(i.subtotal) desc
            """)
    List<ProdutoMaisVendidoResponse> maisVendidos(@Param("inicio") LocalDateTime inicio,
                                                  @Param("fim") LocalDateTime fim,
                                                  Pageable limite);
}
