package br.uneb.ecommerce.dto;

import java.math.BigDecimal;

/** RF10 - linha do relatório de produtos mais vendidos (preenchida por JPQL "select new"). */
public record ProdutoMaisVendidoResponse(Long produtoId, String produtoNome, String categoriaNome,
                                         Long quantidadeVendida, BigDecimal receita) {}
