package br.uneb.ecommerce.repository;

import br.uneb.ecommerce.model.Avaliacao;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    @EntityGraph(attributePaths = "cliente")
    List<Avaliacao> findByProdutoIdOrderByDataDesc(Long produtoId);

    @Query("select avg(a.nota) from Avaliacao a where a.produto.id = :produtoId")
    Double mediaPorProduto(@Param("produtoId") Long produtoId);

    boolean existsByProdutoIdAndClienteId(Long produtoId, Long clienteId);
}
