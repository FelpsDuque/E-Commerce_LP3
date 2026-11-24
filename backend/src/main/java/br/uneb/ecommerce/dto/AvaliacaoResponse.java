package br.uneb.ecommerce.dto;

import br.uneb.ecommerce.model.Avaliacao;

import java.time.LocalDateTime;

public record AvaliacaoResponse(Long id, Long clienteId, String clienteNome, Integer nota,
                                String comentario, LocalDateTime data) {

    public static AvaliacaoResponse from(Avaliacao a) {
        return new AvaliacaoResponse(a.getId(), a.getCliente().getId(), a.getCliente().getNome(),
                a.getNota(), a.getComentario(), a.getData());
    }
}
