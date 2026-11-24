package br.uneb.ecommerce.dto;

import java.util.List;

/** Média, total e lista de avaliações de um produto. */
public record ResumoAvaliacoesResponse(Double media, long total, List<AvaliacaoResponse> avaliacoes) {}
