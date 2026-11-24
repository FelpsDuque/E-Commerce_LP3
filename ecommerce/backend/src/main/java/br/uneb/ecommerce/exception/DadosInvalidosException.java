package br.uneb.ecommerce.exception;

/** Lançada quando os parâmetros informados são inconsistentes entre si -> HTTP 400. */
public class DadosInvalidosException extends RuntimeException {

    public DadosInvalidosException(String mensagem) {
        super(mensagem);
    }
}
