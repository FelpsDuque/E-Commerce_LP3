package br.uneb.ecommerce.controller;

import br.uneb.ecommerce.dto.CategoriaRequest;
import br.uneb.ecommerce.dto.CategoriaResponse;
import br.uneb.ecommerce.service.CategoriaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * RNF02 - O controller apenas recebe a requisição, valida (@Valid / @Positive) e delega ao Service.
 */
@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public List<CategoriaResponse> listar() {
        return categoriaService.listar();
    }

    @GetMapping("/{id}")
    public CategoriaResponse buscar(@PathVariable @Positive Long id) {
        return categoriaService.buscar(id);
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> criar(@RequestBody @Valid CategoriaRequest req) {
        CategoriaResponse criada = categoriaService.criar(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(criada.id()).toUri();
        return ResponseEntity.created(uri).body(criada); // 201
    }

    @PutMapping("/{id}")
    public CategoriaResponse atualizar(@PathVariable @Positive Long id, @RequestBody @Valid CategoriaRequest req) {
        return categoriaService.atualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // 204
    public void excluir(@PathVariable @Positive Long id) {
        categoriaService.excluir(id);
    }
}
