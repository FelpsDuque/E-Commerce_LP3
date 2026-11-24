package br.uneb.ecommerce.controller;

import br.uneb.ecommerce.dto.*;
import br.uneb.ecommerce.service.AvaliacaoService;
import br.uneb.ecommerce.service.ProdutoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;
    private final AvaliacaoService avaliacaoService;

    /**
     * RF03 - Catálogo / listagem paginada.
     * Ex.: GET /api/produtos?nome=fone&categoriaId=1&ativo=true&page=0&size=12&sort=preco,asc
     */
    @GetMapping
    public PaginaResponse<ProdutoResponse> listar(@RequestParam(required = false) String nome,
                                                  @RequestParam(required = false) @Positive Long categoriaId,
                                                  @RequestParam(required = false) Boolean ativo,
                                                  @PageableDefault(size = 12, sort = "nome") Pageable pageable) {
        return produtoService.listar(nome, categoriaId, ativo, pageable);
    }

    @GetMapping("/{id}")
    public ProdutoResponse buscar(@PathVariable @Positive Long id) {
        return produtoService.buscar(id);
    }

    @PostMapping
    public ResponseEntity<ProdutoResponse> criar(@RequestBody @Valid ProdutoRequest req) {
        ProdutoResponse criado = produtoService.criar(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(criado.id()).toUri();
        return ResponseEntity.created(uri).body(criado);
    }

    @PutMapping("/{id}")
    public ProdutoResponse atualizar(@PathVariable @Positive Long id, @RequestBody @Valid ProdutoRequest req) {
        return produtoService.atualizar(id, req);
    }

    /**
     * RN04 - 204 quando o produto é excluído; 200 com mensagem quando ele é apenas inativado
     * (porque já consta em pedidos).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<MensagemResponse> excluir(@PathVariable @Positive Long id) {
        return produtoService.excluir(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    // ---------- RF09 - Avaliações (sub-recurso do produto) ----------
    @GetMapping("/{id}/avaliacoes")
    public ResumoAvaliacoesResponse listarAvaliacoes(@PathVariable @Positive Long id) {
        return avaliacaoService.listar(id);
    }

    @PostMapping("/{id}/avaliacoes")
    public ResponseEntity<AvaliacaoResponse> avaliar(@PathVariable @Positive Long id,
                                                     @RequestBody @Valid AvaliacaoRequest req) {
        return ResponseEntity.status(201).body(avaliacaoService.criar(id, req));
    }
}
