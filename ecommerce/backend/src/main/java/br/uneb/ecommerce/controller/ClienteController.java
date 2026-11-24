package br.uneb.ecommerce.controller;

import br.uneb.ecommerce.dto.ClienteRequest;
import br.uneb.ecommerce.dto.ClienteResponse;
import br.uneb.ecommerce.dto.PaginaResponse;
import br.uneb.ecommerce.dto.PedidoResponse;
import br.uneb.ecommerce.service.ClienteService;
import br.uneb.ecommerce.service.PedidoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;
    private final PedidoService pedidoService;

    @GetMapping
    public PaginaResponse<ClienteResponse> listar(@RequestParam(required = false) String nome,
                                                  @PageableDefault(size = 10, sort = "nome") Pageable pageable) {
        return clienteService.listar(nome, pageable);
    }

    @GetMapping("/{id}")
    public ClienteResponse buscar(@PathVariable @Positive Long id) {
        return clienteService.buscar(id);
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> criar(@RequestBody @Valid ClienteRequest req) {
        ClienteResponse criado = clienteService.criar(req);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(criado.id()).toUri();
        return ResponseEntity.created(uri).body(criado);
    }

    @PutMapping("/{id}")
    public ClienteResponse atualizar(@PathVariable @Positive Long id, @RequestBody @Valid ClienteRequest req) {
        return clienteService.atualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable @Positive Long id) {
        clienteService.excluir(id);
    }

    /** RF06 - Pedidos de um cliente (com itens e status). */
    @GetMapping("/{id}/pedidos")
    public PaginaResponse<PedidoResponse> pedidosDoCliente(
            @PathVariable @Positive Long id,
            @PageableDefault(size = 10, sort = "dataPedido", direction = Sort.Direction.DESC) Pageable pageable) {
        return pedidoService.listarPorCliente(id, pageable);
    }
}
