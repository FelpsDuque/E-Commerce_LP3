package br.uneb.ecommerce.config;

import br.uneb.ecommerce.model.*;
import br.uneb.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * RNF08 - Carga inicial automática (mínimo 5 registros por entidade principal).
 * Inclui de propósito casos para demonstrar as regras na apresentação:
 *  - "Teclado Mecânico RGB" com estoque 0 e "Caixa de Som Portátil" com estoque 2 (RN01);
 *  - "MP3 Player Clássico" inativo e já vendido (RN04);
 *  - pedido #1 com preço antigo do Fone (179,90) enquanto o produto custa 199,90 hoje (RN02);
 *  - pedidos em todos os status, inclusive ENTREGUE e CANCELADO (RN03);
 *  - cupom expirado NATAL15 e cupom inativo INATIVO5 (RF08).
 */
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;
    private final ClienteRepository clienteRepository;
    private final PedidoRepository pedidoRepository;
    private final CupomRepository cupomRepository;
    private final AvaliacaoRepository avaliacaoRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (categoriaRepository.count() > 0) return;

        // ---------- Categorias ----------
        Categoria eletronicos = new Categoria("Eletrônicos", "Fones, relógios e áudio");
        Categoria informatica = new Categoria("Informática", "Computadores e periféricos");
        Categoria livros = new Categoria("Livros", "Livros técnicos de programação");
        Categoria casa = new Categoria("Casa e Cozinha", "Utilidades domésticas");
        Categoria esportes = new Categoria("Esportes", "Artigos esportivos e fitness");
        Categoria moda = new Categoria("Moda", "Roupas e calçados");
        categoriaRepository.saveAll(List.of(eletronicos, informatica, livros, casa, esportes, moda));

        // ---------- Produtos ----------
        Produto fone = produto("Fone Bluetooth XZ", "Fone sem fio com cancelamento de ruído e 30h de bateria.", "179.90", 25, "fone", eletronicos);
        Produto relogio = produto("Smartwatch Fit", "Relógio inteligente com monitor cardíaco e GPS.", "349.90", 10, "smartwatch", eletronicos);
        Produto caixa = produto("Caixa de Som Portátil", "Caixa de som à prova d'água, 20W.", "259.00", 2, "speaker", eletronicos);
        Produto mp3 = produto("MP3 Player Clássico", "Modelo descontinuado.", "129.00", 4, "mp3", eletronicos);
        Produto notebook = produto("Notebook 15\" Core i5", "16 GB RAM, SSD 512 GB, tela Full HD.", "3899.00", 5, "notebook", informatica);
        Produto mouse = produto("Mouse sem Fio", "Mouse óptico 1600 DPI.", "79.90", 40, "mouse", informatica);
        Produto teclado = produto("Teclado Mecânico RGB", "Switch blue, ABNT2.", "289.90", 0, "keyboard", informatica);
        Produto livroJava = produto("Livro: Java do Zero ao Spring", "Guia prático de Java e Spring Boot.", "89.90", 15, "bookjava", livros);
        Produto livroAngular = produto("Livro: Angular na Prática", "Construindo SPAs com Angular e Material.", "74.90", 12, "bookangular", livros);
        Produto cafeteira = produto("Cafeteira Elétrica", "Capacidade 1,2 L, 30 xícaras.", "189.90", 8, "coffee", casa);
        Produto panelas = produto("Jogo de Panelas 5 peças", "Antiaderente, cabo de baquelite.", "329.00", 6, "pans", casa);
        Produto bola = produto("Bola de Futebol", "Bola oficial tamanho 5.", "99.90", 20, "ball", esportes);
        Produto tapete = produto("Tapete de Yoga", "Antiderrapante, 6 mm.", "69.90", 18, "yoga", esportes);
        Produto camiseta = produto("Camiseta Básica", "100% algodão.", "39.90", 50, "tshirt", moda);
        Produto tenis = produto("Tênis de Corrida", "Amortecimento em gel.", "279.90", 9, "sneakers", moda);
        produtoRepository.saveAll(List.of(fone, relogio, caixa, mp3, notebook, mouse, teclado, livroJava,
                livroAngular, cafeteira, panelas, bola, tapete, camiseta, tenis));

        // ---------- Clientes ----------
        Cliente ana = new Cliente("Ana Souza", "ana.souza@email.com", "11122233344", "71991112222", "Rua das Flores, 10 - Salvador/BA");
        Cliente bruno = new Cliente("Bruno Lima", "bruno.lima@email.com", "22233344455", "71992223333", "Av. Sete de Setembro, 200 - Salvador/BA");
        Cliente carla = new Cliente("Carla Mendes", "carla.mendes@email.com", "33344455566", "75993334444", "Rua Barão, 45 - Feira de Santana/BA");
        Cliente diego = new Cliente("Diego Santos", "diego.santos@email.com", "44455566677", "71994445555", "Rua do Sol, 8 - Lauro de Freitas/BA");
        Cliente elisa = new Cliente("Elisa Rocha", "elisa.rocha@email.com", "55566677788", "73995556666", "Av. Itabuna, 300 - Ilhéus/BA");
        Cliente fabio = new Cliente("Fábio Nunes", "fabio.nunes@email.com", "66677788899", null, "Rua Nova, 12 - Camaçari/BA"); // sem pedidos: pode ser excluído
        clienteRepository.saveAll(List.of(ana, bruno, carla, diego, elisa, fabio));

        // ---------- Cupons ----------
        LocalDate hoje = LocalDate.now();
        Cupom bemVindo = new Cupom("BEMVINDO10", new BigDecimal("10"), hoje.plusDays(60));
        Cupom black = new Cupom("BLACKFRIDAY25", new BigDecimal("25"), hoje.plusDays(7));
        Cupom frete = new Cupom("UNEB5", new BigDecimal("5"), hoje.plusDays(180));
        Cupom natal = new Cupom("NATAL15", new BigDecimal("15"), hoje.minusDays(10)); // expirado
        Cupom inativo = new Cupom("INATIVO5", new BigDecimal("5"), hoje.plusDays(30));
        inativo.setAtivo(false);
        cupomRepository.saveAll(List.of(bemVindo, black, frete, natal, inativo));

        // ---------- Pedidos ----------
        // Pedido #1 - criado com o Fone ainda a 179,90 (RN02)
        Pedido p1 = pedido(ana, StatusPedido.ENTREGUE, 50, null, mp3, 1, fone, 1);
        fone.setPreco(new BigDecimal("199.90")); // preço mudou depois da compra; o pedido não muda
        mp3.setAtivo(false);                      // RN04: descontinuado, mas já vendido -> inativo

        Pedido p2 = pedido(ana, StatusPedido.ENTREGUE, 40, null, notebook, 1, mouse, 1);
        Pedido p3 = pedido(bruno, StatusPedido.ENVIADO, 20, bemVindo, fone, 2);
        Pedido p4 = pedido(elisa, StatusPedido.CANCELADO, 10, null, bola, 1, camiseta, 3);
        Pedido p5 = pedido(carla, StatusPedido.PAGO, 5, null, livroJava, 1, livroAngular, 1);
        Pedido p6 = pedido(diego, StatusPedido.PENDENTE, 1, null, cafeteira, 1);
        Pedido p7 = pedido(bruno, StatusPedido.PENDENTE, 0, black, mouse, 2, camiseta, 2);
        pedidoRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6, p7));

        // ---------- Avaliações (só de quem comprou) ----------
        avaliacaoRepository.saveAll(List.of(
                new Avaliacao(notebook, ana, 5, "Excelente desempenho, chegou antes do prazo."),
                new Avaliacao(mouse, ana, 4, "Bom custo-benefício."),
                new Avaliacao(mp3, ana, 3, "Funciona, mas a bateria dura pouco."),
                new Avaliacao(fone, bruno, 5, "Som muito bom e cancelamento de ruído eficiente."),
                new Avaliacao(livroJava, carla, 4, "Didático, ótimo para iniciantes.")
        ));

        log.info(">>> Carga inicial concluída: {} categorias, {} produtos, {} clientes, {} pedidos, {} cupons.",
                categoriaRepository.count(), produtoRepository.count(), clienteRepository.count(),
                pedidoRepository.count(), cupomRepository.count());
    }

    private Produto produto(String nome, String descricao, String preco, int estoque, String imagem, Categoria cat) {
        return new Produto(nome, descricao, new BigDecimal(preco), estoque,
                "https://picsum.photos/seed/" + imagem + "/400/300", cat);
    }

    /** Monta um pedido "histórico". Pares (Produto, quantidade). Baixa o estoque, exceto se cancelado. */
    private Pedido pedido(Cliente cliente, StatusPedido status, int diasAtras, Cupom cupom, Object... produtoQtd) {
        Pedido p = new Pedido();
        p.setCliente(cliente);
        p.setStatus(status);
        p.setDataPedido(LocalDateTime.now().minusDays(diasAtras).withHour(10 + diasAtras % 8).withMinute(15));
        for (int i = 0; i < produtoQtd.length; i += 2) {
            Produto prod = (Produto) produtoQtd[i];
            int qtd = (Integer) produtoQtd[i + 1];
            p.adicionarItem(new ItemPedido(prod, qtd));
            if (status != StatusPedido.CANCELADO) prod.baixarEstoque(qtd);
        }
        BigDecimal subtotal = p.getItens().stream().map(ItemPedido::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal desconto = BigDecimal.ZERO;
        if (cupom != null) {
            p.setCupom(cupom);
            desconto = subtotal.multiply(cupom.getPercentual()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        p.setSubtotal(subtotal);
        p.setDesconto(desconto);
        p.setTotal(subtotal.subtract(desconto));
        return p;
    }
}
