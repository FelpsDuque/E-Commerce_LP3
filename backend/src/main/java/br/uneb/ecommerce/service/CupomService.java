package br.uneb.ecommerce.service;

import br.uneb.ecommerce.dto.CupomRequest;
import br.uneb.ecommerce.dto.CupomResponse;
import br.uneb.ecommerce.exception.RecursoNaoEncontradoException;
import br.uneb.ecommerce.exception.RegraNegocioException;
import br.uneb.ecommerce.model.Cupom;
import br.uneb.ecommerce.repository.CupomRepository;
import br.uneb.ecommerce.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/** RF08 - Cupom de desconto percentual com data de validade. */
@Service
@RequiredArgsConstructor
public class CupomService {

    private final CupomRepository cupomRepository;
    private final PedidoRepository pedidoRepository;

    @Transactional(readOnly = true)
    public List<CupomResponse> listar() {
        return cupomRepository.findAll(Sort.by(Sort.Direction.DESC, "validade")).stream()
                .map(CupomResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CupomResponse buscar(Long id) {
        return CupomResponse.from(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public CupomResponse buscarPorCodigo(String codigo) {
        return cupomRepository.findByCodigoIgnoreCase(codigo.trim())
                .map(CupomResponse::from)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cupom '" + codigo + "' não encontrado."));
    }

    @Transactional
    public CupomResponse criar(CupomRequest req) {
        if (cupomRepository.existsByCodigoIgnoreCase(req.codigo())) {
            throw new RegraNegocioException("Já existe um cupom com o código " + req.codigo() + ".");
        }
        Cupom c = new Cupom(req.codigo(), req.percentual(), req.validade());
        if (req.ativo() != null) c.setAtivo(req.ativo());
        return CupomResponse.from(cupomRepository.save(c));
    }

    @Transactional
    public CupomResponse atualizar(Long id, CupomRequest req) {
        Cupom c = buscarEntidade(id);
        if (cupomRepository.existsByCodigoIgnoreCaseAndIdNot(req.codigo(), id)) {
            throw new RegraNegocioException("Já existe outro cupom com o código " + req.codigo() + ".");
        }
        c.setCodigo(req.codigo());
        c.setPercentual(req.percentual());
        c.setValidade(req.validade());
        if (req.ativo() != null) c.setAtivo(req.ativo());
        return CupomResponse.from(c);
    }

    @Transactional
    public void excluir(Long id) {
        Cupom c = buscarEntidade(id);
        if (pedidoRepository.existsByCupomId(id)) {
            throw new RegraNegocioException("O cupom " + c.getCodigo()
                    + " já foi usado em pedidos e não pode ser excluído. Desative-o.");
        }
        cupomRepository.delete(c);
    }

    /** Usado na finalização do pedido: devolve o cupom somente se estiver ativo e dentro da validade. */
    Cupom validarParaUso(String codigo) {
        Cupom c = cupomRepository.findByCodigoIgnoreCase(codigo.trim())
                .orElseThrow(() -> new RegraNegocioException("Cupom '" + codigo + "' não existe."));
        if (!c.isValidoEm(LocalDate.now())) {
            throw new RegraNegocioException("O cupom " + c.getCodigo() + " está inativo ou expirou em "
                    + c.getValidade() + ".");
        }
        return c;
    }

    private Cupom buscarEntidade(Long id) {
        return cupomRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cupom", id));
    }
}
