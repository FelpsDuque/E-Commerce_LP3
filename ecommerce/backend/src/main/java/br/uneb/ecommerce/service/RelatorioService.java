package br.uneb.ecommerce.service;

import br.uneb.ecommerce.dto.ProdutoMaisVendidoResponse;
import br.uneb.ecommerce.exception.DadosInvalidosException;
import br.uneb.ecommerce.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/** RF10 - Relatório de produtos mais vendidos no período. */
@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final PedidoRepository pedidoRepository;

    @Transactional(readOnly = true)
    public List<ProdutoMaisVendidoResponse> maisVendidos(LocalDate inicio, LocalDate fim, int limite) {
        LocalDate fimEfetivo = fim != null ? fim : LocalDate.now();
        LocalDate inicioEfetivo = inicio != null ? inicio : fimEfetivo.minusDays(30);
        if (inicioEfetivo.isAfter(fimEfetivo)) {
            throw new DadosInvalidosException("A data inicial não pode ser posterior à data final.");
        }
        // intervalo fechado em dias: [inicio 00:00, fim+1 00:00)
        return pedidoRepository.maisVendidos(inicioEfetivo.atStartOfDay(),
                fimEfetivo.plusDays(1).atStartOfDay(), PageRequest.of(0, limite));
    }
}
