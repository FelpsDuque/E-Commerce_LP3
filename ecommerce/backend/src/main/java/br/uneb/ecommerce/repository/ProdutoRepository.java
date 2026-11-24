package br.uneb.ecommerce.repository;

import br.uneb.ecommerce.model.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProdutoRepository extends JpaRepository<Produto, Long>, JpaSpecificationExecutor<Produto> {

    /** RNF14 - busca paginada com filtros executada no banco (Specification gera SQL parametrizado). */
    @Override
    @EntityGraph(attributePaths = "categoria")
    Page<Produto> findAll(Specification<Produto> spec, Pageable pageable);

    long countByCategoriaId(Long categoriaId);

    // ---------- Specifications (filtros dinâmicos) ----------
    static Specification<Produto> nomeContem(String nome) {
        return (root, query, cb) -> (nome == null || nome.isBlank()) ? null
                : cb.like(cb.lower(root.get("nome")), "%" + nome.trim().toLowerCase() + "%");
    }

    static Specification<Produto> daCategoria(Long categoriaId) {
        return (root, query, cb) -> categoriaId == null ? null
                : cb.equal(root.get("categoria").get("id"), categoriaId);
    }

    static Specification<Produto> comAtivo(Boolean ativo) {
        return (root, query, cb) -> ativo == null ? null : cb.equal(root.get("ativo"), ativo);
    }
}
