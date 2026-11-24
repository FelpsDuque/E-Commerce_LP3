package br.uneb.ecommerce.controller;

import br.uneb.ecommerce.dto.PaginaResponse;
import br.uneb.ecommerce.dto.PedidoRequest;
import br.uneb.ecommerce.dto.PedidoResponse;
import br.uneb.ecommerce.dto.StatusPedidoRequest;
import br.uneb.ecommerce.model.StatusPedido;
import br.uneb.ecommerce.service.PedidoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    public PaginaResponse<PedidoResponse> listar(
            @RequestParam(required = false) @Positive Long clienteId,
            @RequestParam(required = false) StatusPedido status,
            @PageableDefault(size = 10, sort = "dataPedido", direction = Sort.Direction.DESC) Pageable pageable) {
        return pedidoService.listar(clienteId, status, pageable);
    }

    @GetMapping("/{id}")
    public PedidoResponse buscar(@PathVariable @Positive Long id) {
        return pedidoService.buscar(id);
    }

    /** RF05 - Finalizar pedido (checkout do carrinho). */
    @PostMapping
    public ResponseEntity<PedidoResponse> finalizar(@RequestBody @Valid PedidoRequest req) {
        PedidoResponse criado = pedidoService.finalizar(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(criado.id()).toUri();
        return ResponseEntity.created(uri).body(criado);
    }

    /** RF07 - Alterar status. PATCH porque altera só uma parte do recurso. */
    @PatchMapping("/{id}/status")
    public PedidoResponse alterarStatus(@PathVariable @Positive Long id,
                                        @RequestBody @Valid StatusPedidoRequest req) {
        return pedidoService.alterarStatus(id, req.status());
    }
}
