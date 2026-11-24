package br.uneb.ecommerce.service;

import br.uneb.ecommerce.dto.ItemPedidoRequest;
import br.uneb.ecommerce.dto.PaginaResponse;
import br.uneb.ecommerce.dto.PedidoRequest;
import br.uneb.ecommerce.dto.PedidoResponse;
import br.uneb.ecommerce.exception.RecursoNaoEncontradoException;
import br.uneb.ecommerce.exception.RegraNegocioException;
import br.uneb.ecommerce.model.*;
import br.uneb.ecommerce.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Coração das regras de negócio do E-commerce:
 * RF05 (finalizar pedido), RF06 (consultar), RF07 (alterar status) e RN01, RN02, RN03.
 */
@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ClienteService clienteService;
    private final ProdutoService produtoService;
    private final CupomService cupomService;

    /**
     * RF05 - Finaliza o pedido a partir dos itens do carrinho.
     * Tudo roda em UMA transação: se qualquer regra falhar, nada é gravado e o estoque não muda.
     */
    @Transactional
    public PedidoResponse finalizar(PedidoRequest req) {
        Cliente cliente = clienteService.buscarEntidade(req.clienteId());

        // Agrupa itens repetidos do mesmo produto (ex.: duas linhas do produto 3 viram uma só)
        Map<Long, Integer> quantidades = new LinkedHashMap<>();
        for (ItemPedidoRequest item : req.itens()) {
            quantidades.merge(item.produtoId(), item.quantidade(), Integer::sum);
        }

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setDataPedido(LocalDateTime.now());
        pedido.setStatus(StatusPedido.PENDENTE);

        List<String> problemas = new ArrayList<>();
        for (Map.Entry<Long, Integer> e : quantidades.entrySet()) {
            Produto produto = produtoService.buscarEntidade(e.getKey());
            int qtd = e.getValue();

            if (!Boolean.TRUE.equals(produto.getAtivo())) {
                problemas.add("'" + produto.getNome() + "' está indisponível");
                continue;
            }
            // RN01 - quantidade não pode ser maior que o estoque disponível
            if (qtd > produto.getEstoque()) {
                problemas.add("'" + produto.getNome() + "': solicitado " + qtd
                        + ", disponível " + produto.getEstoque());
                continue;
            }
            // RN02 - o construtor de ItemPedido grava o preço atual do produto (preço congelado)
            pedido.adicionarItem(new ItemPedido(produto, qtd));
        }

        if (!problemas.isEmpty()) {
            throw new RegraNegocioException("Não foi possível finalizar o pedido. Estoque insuficiente ou produto indisponível: "
                    + String.join("; ", problemas) + ".");
        }

        // RN01 - ao finalizar, baixa o estoque de cada produto
        pedido.getItens().forEach(i -> i.getProduto().baixarEstoque(i.getQuantidade()));

        // Totais calculados SEMPRE no servidor (RNF27)
        BigDecimal subtotal = pedido.getItens().stream()
                .map(ItemPedido::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal desconto = BigDecimal.ZERO;

        // RF08 - cupom opcional
        if (req.codigoCupom() != null && !req.codigoCupom().isBlank()) {
            Cupom cupom = cupomService.validarParaUso(req.codigoCupom());
            pedido.setCupom(cupom);
            desconto = subtotal.multiply(cupom.getPercentual())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        pedido.setSubtotal(subtotal);
        pedido.setDesconto(desconto);
        pedido.setTotal(subtotal.subtract(desconto));

        return PedidoResponse.from(pedidoRepository.save(pedido));
    }

    /** Listagem paginada com filtros opcionais por cliente e status (consulta no banco). */
    @Transactional(readOnly = true)
    public PaginaResponse<PedidoResponse> listar(Long clienteId, StatusPedido status, Pageable pageable) {
        return PaginaResponse.of(pedidoRepository.buscar(clienteId, status, pageable).map(PedidoResponse::from));
    }

    /** RF06 - pedidos de um cliente. */
    @Transactional(readOnly = true)
    public PaginaResponse<PedidoResponse> listarPorCliente(Long clienteId, Pageable pageable) {
        clienteService.buscarEntidade(clienteId); // 404 se o cliente não existir
        return listar(clienteId, null, pageable);
    }

    @Transactional(readOnly = true)
    public PedidoResponse buscar(Long id) {
        return PedidoResponse.from(buscarEntidade(id));
    }

    /**
     * RF07 / RN03 - Altera o status do pedido.
     * - Fluxo normal só avança um passo: PENDENTE -> PAGO -> ENVIADO -> ENTREGUE (não retrocede).
     * - CANCELADO só a partir de PENDENTE ou PAGO, devolvendo as quantidades ao estoque.
     */
    @Transactional
    public PedidoResponse alterarStatus(Long id, StatusPedido novo) {
        Pedido pedido = buscarEntidade(id);
        StatusPedido atual = pedido.getStatus();

        if (atual == novo) {
            throw new RegraNegocioException("O pedido #" + id + " já está com status " + atual + ".");
        }
        if (atual.isFinal()) {
            throw new RegraNegocioException("O pedido #" + id + " está " + atual + " e não pode mais ser alterado.");
        }

        if (novo == StatusPedido.CANCELADO) {
            if (!atual.podeCancelar()) {
                throw new RegraNegocioException("Só é possível cancelar pedidos PENDENTE ou PAGO. Status atual: " + atual + ".");
            }
            // RN03 - cancelamento devolve as quantidades ao estoque
            pedido.getItens().forEach(i -> i.getProduto().devolverEstoque(i.getQuantidade()));
        } else if (novo != atual.proximo()) {
            if (novo.ordinal() < atual.ordinal()) {
                throw new RegraNegocioException("O status não pode retroceder de " + atual + " para " + novo + ".");
            }
            throw new RegraNegocioException("Transição inválida: de " + atual + " o próximo status permitido é "
                    + atual.proximo() + ".");
        }

        pedido.setStatus(novo);
        return PedidoResponse.from(pedido);
    }

    private Pedido buscarEntidade(Long id) {
        return pedidoRepository.findComItensById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido", id));
    }
}
