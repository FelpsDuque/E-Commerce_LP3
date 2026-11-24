package br.uneb.ecommerce.controller;

import br.uneb.ecommerce.dto.CupomRequest;
import br.uneb.ecommerce.dto.CupomResponse;
import br.uneb.ecommerce.service.CupomService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cupons")
@RequiredArgsConstructor
public class CupomController {

    private final CupomService cupomService;

    @GetMapping
    public List<CupomResponse> listar() {
        return cupomService.listar();
    }

    @GetMapping("/{id}")
    public CupomResponse buscar(@PathVariable @Positive Long id) {
        return cupomService.buscar(id);
    }

    /** Consulta por código (usada no carrinho para conferir o cupom antes de finalizar). */
    @GetMapping("/codigo/{codigo}")
    public CupomResponse buscarPorCodigo(@PathVariable @Size(max = 30) String codigo) {
        return cupomService.buscarPorCodigo(codigo);
    }

    @PostMapping
    public ResponseEntity<CupomResponse> criar(@RequestBody @Valid CupomRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cupomService.criar(req));
    }

    @PutMapping("/{id}")
    public CupomResponse atualizar(@PathVariable @Positive Long id, @RequestBody @Valid CupomRequest req) {
        return cupomService.atualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable @Positive Long id) {
        cupomService.excluir(id);
    }
}
