package br.uneb.ecommerce.service;

import br.uneb.ecommerce.dto.MensagemResponse;
import br.uneb.ecommerce.dto.PaginaResponse;
import br.uneb.ecommerce.dto.ProdutoRequest;
import br.uneb.ecommerce.dto.ProdutoResponse;
import br.uneb.ecommerce.exception.RecursoNaoEncontradoException;
import br.uneb.ecommerce.model.Categoria;
import br.uneb.ecommerce.model.Produto;
import br.uneb.ecommerce.repository.ItemPedidoRepository;
import br.uneb.ecommerce.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static br.uneb.ecommerce.repository.ProdutoRepository.*;

/** RF01 (manter produtos), RF03 (catálogo com busca e filtro) e RN04. */
@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final ItemPedidoRepository itemPedidoRepository;
    private final CategoriaService categoriaService;

    /** RF03 / RNF14 - busca e filtros executados no banco, com paginação. */
    @Transactional(readOnly = true)
    public PaginaResponse<ProdutoResponse> listar(String nome, Long categoriaId, Boolean ativo, Pageable pageable) {
        Specification<Produto> filtro = nomeContem(nome).and(daCategoria(categoriaId)).and(comAtivo(ativo));
        return PaginaResponse.of(produtoRepository.findAll(filtro, pageable).map(ProdutoResponse::from));
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscar(Long id) {
        return ProdutoResponse.from(buscarEntidade(id));
    }

    @Transactional
    public ProdutoResponse criar(ProdutoRequest req) {
        Categoria categoria = categoriaService.buscarEntidade(req.categoriaId());
        Produto p = new Produto(req.nome().trim(), req.descricao(), req.preco(), req.estoque(),
                vazioParaNull(req.imagemUrl()), categoria);
        return ProdutoResponse.from(produtoRepository.save(p));
    }

    @Transactional
    public ProdutoResponse atualizar(Long id, ProdutoRequest req) {
        Produto p = buscarEntidade(id);
        // RNF27 - copia somente os campos editáveis (id e versão nunca vêm do JSON)
        p.setNome(req.nome().trim());
        p.setDescricao(req.descricao());
        p.setPreco(req.preco()); // RN02: não afeta pedidos antigos, pois o item guarda o próprio preço
        p.setEstoque(req.estoque());
        p.setImagemUrl(vazioParaNull(req.imagemUrl()));
        p.setCategoria(categoriaService.buscarEntidade(req.categoriaId()));
        if (req.ativo() != null) {
            p.setAtivo(req.ativo());
        }
        return ProdutoResponse.from(p);
    }

    /**
     * RN04 - Produto que já consta em pedido não pode ser excluído fisicamente: é inativado.
     * @return mensagem quando o produto foi inativado; vazio quando foi realmente excluído.
     */
    @Transactional
    public Optional<MensagemResponse> excluir(Long id) {
        Produto p = buscarEntidade(id);
        if (itemPedidoRepository.existsByProdutoId(id)) {
            p.setAtivo(false);
            return Optional.of(new MensagemResponse("O produto '" + p.getNome()
                    + "' já consta em pedidos e foi INATIVADO (não aparece mais no catálogo)."));
        }
        produtoRepository.delete(p);
        return Optional.empty();
    }

    Produto buscarEntidade(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto", id));
    }

    private static String vazioParaNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
