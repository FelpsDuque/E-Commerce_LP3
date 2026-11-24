package br.uneb.ecommerce.model;

/**
 * RF07 / RN03 - Status do pedido.
 * A ordem de declaração define o fluxo: PENDENTE -> PAGO -> ENVIADO -> ENTREGUE.
 * CANCELADO é um estado final que só pode ser alcançado a partir de PENDENTE ou PAGO.
 */
public enum StatusPedido {
    PENDENTE,
    PAGO,
    ENVIADO,
    ENTREGUE,
    CANCELADO;

    /** Próximo status no fluxo normal (null quando não existe). */
    public StatusPedido proximo() {
        return switch (this) {
            case PENDENTE -> PAGO;
            case PAGO -> ENVIADO;
            case ENVIADO -> ENTREGUE;
            default -> null;
        };
    }

    /** RN03 - só pode cancelar nos status Pendente ou Pago. */
    public boolean podeCancelar() {
        return this == PENDENTE || this == PAGO;
    }

    public boolean isFinal() {
        return this == ENTREGUE || this == CANCELADO;
    }
}
