package br.uneb.ecommerce.dto;

import br.uneb.ecommerce.model.Cliente;

public record ClienteResponse(Long id, String nome, String email, String cpf,
                              String telefone, String endereco) {

    public static ClienteResponse from(Cliente c) {
        return new ClienteResponse(c.getId(), c.getNome(), c.getEmail(), c.getCpf(),
                c.getTelefone(), c.getEndereco());
    }
}
