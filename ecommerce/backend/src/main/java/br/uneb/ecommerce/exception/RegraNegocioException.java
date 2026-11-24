package br.uneb.ecommerce.exception;

/** Lançada quando uma regra de negócio (RN01..RN04) é violada -> HTTP 409. */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
