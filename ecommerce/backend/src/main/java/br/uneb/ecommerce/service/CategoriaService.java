package br.uneb.ecommerce.service;

import br.uneb.ecommerce.dto.CategoriaRequest;
import br.uneb.ecommerce.dto.CategoriaResponse;
import br.uneb.ecommerce.exception.RecursoNaoEncontradoException;
import br.uneb.ecommerce.exception.RegraNegocioException;
import br.uneb.ecommerce.model.Categoria;
import br.uneb.ecommerce.repository.CategoriaRepository;
import br.uneb.ecommerce.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** RF02 - Manter categorias. */
@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return categoriaRepository.findAll(Sort.by("nome")).stream()
                .map(c -> CategoriaResponse.from(c, produtoRepository.countByCategoriaId(c.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse buscar(Long id) {
        Categoria c = buscarEntidade(id);
        return CategoriaResponse.from(c, produtoRepository.countByCategoriaId(id));
    }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest req) {
        String nome = req.nome().trim();
        if (categoriaRepository.existsByNomeIgnoreCase(nome)) {
            throw new RegraNegocioException("Já existe uma categoria com o nome '" + nome + "'.");
        }
        Categoria salva = categoriaRepository.save(new Categoria(nome, req.descricao()));
        return CategoriaResponse.from(salva, 0);
    }

    @Transactional
    public CategoriaResponse atualizar(Long id, CategoriaRequest req) {
        Categoria c = buscarEntidade(id);
        String nome = req.nome().trim();
        if (categoriaRepository.existsByNomeIgnoreCaseAndIdNot(nome, id)) {
            throw new RegraNegocioException("Já existe uma categoria com o nome '" + nome + "'.");
        }
        // RNF27 - copia apenas os campos editáveis
        c.setNome(nome);
        c.setDescricao(req.descricao());
        return CategoriaResponse.from(c, produtoRepository.countByCategoriaId(id));
    }

    @Transactional
    public void excluir(Long id) {
        Categoria c = buscarEntidade(id);
        long qtd = produtoRepository.countByCategoriaId(id);
        if (qtd > 0) {
            throw new RegraNegocioException("A categoria '" + c.getNome() + "' possui " + qtd
                    + " produto(s) e não pode ser excluída. Mova ou exclua os produtos antes.");
        }
        categoriaRepository.delete(c);
    }

    Categoria buscarEntidade(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", id));
    }
}
