package br.uneb.ecommerce.service;

import br.uneb.ecommerce.dto.AvaliacaoRequest;
import br.uneb.ecommerce.dto.AvaliacaoResponse;
import br.uneb.ecommerce.dto.ResumoAvaliacoesResponse;
import br.uneb.ecommerce.exception.RegraNegocioException;
import br.uneb.ecommerce.model.Avaliacao;
import br.uneb.ecommerce.model.Cliente;
import br.uneb.ecommerce.model.Produto;
import br.uneb.ecommerce.model.StatusPedido;
import br.uneb.ecommerce.repository.AvaliacaoRepository;
import br.uneb.ecommerce.repository.ItemPedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** RF09 - Avaliação de produto (nota de 1 a 5 e comentário). */
@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final ItemPedidoRepository itemPedidoRepository;
    private final ProdutoService produtoService;
    private final ClienteService clienteService;

    @Transactional(readOnly = true)
    public ResumoAvaliacoesResponse listar(Long produtoId) {
        produtoService.buscarEntidade(produtoId);
        List<AvaliacaoResponse> lista = avaliacaoRepository.findByProdutoIdOrderByDataDesc(produtoId)
                .stream().map(AvaliacaoResponse::from).toList();
        Double media = avaliacaoRepository.mediaPorProduto(produtoId);
        return new ResumoAvaliacoesResponse(media, lista.size(), lista);
    }

    /**
     * Regras complementares (documentadas no README):
     * - só avalia quem comprou o produto em um pedido não cancelado;
     * - cada cliente avalia um produto uma única vez.
     */
    @Transactional
    public AvaliacaoResponse criar(Long produtoId, AvaliacaoRequest req) {
        Produto produto = produtoService.buscarEntidade(produtoId);
        Cliente cliente = clienteService.buscarEntidade(req.clienteId());

        if (!itemPedidoRepository.existsByProdutoIdAndPedidoClienteIdAndPedidoStatusNot(
                produtoId, cliente.getId(), StatusPedido.CANCELADO)) {
            throw new RegraNegocioException("Somente clientes que compraram '" + produto.getNome()
                    + "' podem avaliá-lo.");
        }
        if (avaliacaoRepository.existsByProdutoIdAndClienteId(produtoId, cliente.getId())) {
            throw new RegraNegocioException(cliente.getNome() + " já avaliou este produto.");
        }
        Avaliacao a = new Avaliacao(produto, cliente, req.nota(), req.comentario());
        return AvaliacaoResponse.from(avaliacaoRepository.save(a));
    }
}
