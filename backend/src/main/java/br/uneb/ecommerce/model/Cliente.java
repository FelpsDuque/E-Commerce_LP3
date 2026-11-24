package br.uneb.ecommerce.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/** Cliente 1:N Pedido */
@Entity
@Table(name = "cliente")
@Getter
@Setter
@NoArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 120, unique = true)
    private String email;

    /** Somente os 11 dígitos */
    @Column(nullable = false, length = 11, unique = true)
    private String cpf;

    @Column(length = 20)
    private String telefone;

    @Column(length = 255)
    private String endereco;

    @OneToMany(mappedBy = "cliente")
    private List<Pedido> pedidos = new ArrayList<>();

    public Cliente(String nome, String email, String cpf, String telefone, String endereco) {
        this.nome = nome;
        this.email = email;
        this.cpf = cpf;
        this.telefone = telefone;
        this.endereco = endereco;
    }
}
