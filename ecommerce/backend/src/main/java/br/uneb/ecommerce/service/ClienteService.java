package br.uneb.ecommerce.service;

import br.uneb.ecommerce.dto.ClienteRequest;
import br.uneb.ecommerce.dto.ClienteResponse;
import br.uneb.ecommerce.dto.PaginaResponse;
import br.uneb.ecommerce.exception.RecursoNaoEncontradoException;
import br.uneb.ecommerce.exception.RegraNegocioException;
import br.uneb.ecommerce.model.Cliente;
import br.uneb.ecommerce.repository.ClienteRepository;
import br.uneb.ecommerce.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Manter clientes (CRUD). */
@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final PedidoRepository pedidoRepository;

    @Transactional(readOnly = true)
    public PaginaResponse<ClienteResponse> listar(String nome, Pageable pageable) {
        String filtro = nome == null ? "" : nome.trim();
        return PaginaResponse.of(clienteRepository.findByNomeContainingIgnoreCase(filtro, pageable)
                .map(ClienteResponse::from));
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscar(Long id) {
        return ClienteResponse.from(buscarEntidade(id));
    }

    @Transactional
    public ClienteResponse criar(ClienteRequest req) {
        String email = req.email().trim().toLowerCase();
        if (clienteRepository.existsByEmailIgnoreCase(email)) {
            throw new RegraNegocioException("Já existe um cliente com o e-mail " + email + ".");
        }
        if (clienteRepository.existsByCpf(req.cpf())) {
            throw new RegraNegocioException("Já existe um cliente com este CPF.");
        }
        Cliente c = new Cliente(req.nome().trim(), email, req.cpf(), vazioParaNull(req.telefone()), req.endereco());
        return ClienteResponse.from(clienteRepository.save(c));
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest req) {
        Cliente c = buscarEntidade(id);
        String email = req.email().trim().toLowerCase();
        if (clienteRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new RegraNegocioException("Já existe outro cliente com o e-mail " + email + ".");
        }
        if (clienteRepository.existsByCpfAndIdNot(req.cpf(), id)) {
            throw new RegraNegocioException("Já existe outro cliente com este CPF.");
        }
        c.setNome(req.nome().trim());
        c.setEmail(email);
        c.setCpf(req.cpf());
        c.setTelefone(vazioParaNull(req.telefone()));
        c.setEndereco(req.endereco());
        return ClienteResponse.from(c);
    }

    @Transactional
    public void excluir(Long id) {
        Cliente c = buscarEntidade(id);
        if (pedidoRepository.existsByClienteId(id)) {
            throw new RegraNegocioException("O cliente '" + c.getNome()
                    + "' possui pedidos registrados e não pode ser excluído.");
        }
        clienteRepository.delete(c);
    }

    Cliente buscarEntidade(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente", id));
    }

    private static String vazioParaNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
