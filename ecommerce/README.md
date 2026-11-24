# Loja Virtual (E-commerce) — AV4 Linguagem de Programação III

Sistema web completo em arquitetura **MVC** com **Spring Boot** (backend REST) e **Angular + Angular Material** (frontend).
UNEB — Sistemas de Informação — 2026.2 — Prof. Vagner Fonseca.

## Integrantes

| Nome | Matrícula | Responsabilidade principal |
|------|-----------|----------------------------|
| _preencher_ | | |
| _preencher_ | | |
| _preencher_ | | |
| _preencher_ | | |

## Tecnologias e versões

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Backend | Java | 17 ou superior (testado no 21) |
| Backend | Spring Boot (Web, Data JPA, Validation) | 3.5.0 |
| Backend | Hibernate / JPA | 6.6 (gerenciado pelo Spring Boot) |
| Backend | Banco H2 em memória | gerenciado pelo Spring Boot |
| Backend | Lombok | gerenciado pelo Spring Boot |
| Frontend | Node.js | 20.19+ ou 22 |
| Frontend | Angular / Angular CLI | 20.3 |
| Frontend | Angular Material / CDK | 20.2 |

## Como executar

### 1. Backend (porta 8080)

```bash
cd backend
mvn spring-boot:run
```

Ou abra a pasta `backend` no IntelliJ / VS Code / Eclipse e execute `EcommerceApplication`.
Ao iniciar, a classe `DataLoader` popula o banco automaticamente.

- API: http://localhost:8080/api/produtos
- Console do H2: http://localhost:8080/h2-console — JDBC URL `jdbc:h2:mem:ecommerce`, usuário `sa`, senha em branco.

> Para usar MySQL/PostgreSQL basta trocar a dependência do driver no `pom.xml` e as linhas `spring.datasource.*` do `application.properties`.

### 2. Frontend (porta 4200)

```bash
cd frontend
npm install
npm start          # equivale a: ng serve (usa proxy.conf.json -> localhost:8080)
```

Acesse http://localhost:4200. As chamadas para `/api` são redirecionadas ao backend pelo proxy do Angular (sem erro de CORS). O backend também libera `http://localhost:4200` em `CorsConfig`.

## Estrutura do projeto

```
backend/src/main/java/br/uneb/ecommerce
├── config/        CorsConfig, DataLoader (carga inicial)
├── controller/    Recebem HTTP, validam (@Valid/@Positive) e delegam ao service
├── service/       TODAS as regras de negócio (RN01–RN04)
├── repository/    Spring Data JPA (consultas parametrizadas / Specifications)
├── model/         Entidades JPA + enum StatusPedido
├── dto/           Records de entrada (Request) e saída (Response)
└── exception/     Exceções de domínio + GlobalExceptionHandler

frontend/src/app
├── app.*          Layout com menu persistente e rotas
├── features/      Uma pasta por funcionalidade (models, services, components, *.routes.ts)
│   ├── catalogo  carrinho  produtos  categorias  clientes  pedidos  cupons  relatorios  home
└── shared/        ConfirmDialog, EstadoVazio, pipes (statusPedido, cpf, telefone), NotificacaoService
```

## Dados de teste (carregados ao iniciar)

| Entidade | Qtd | Casos especiais para a demonstração |
|----------|-----|--------------------------------------|
| Categorias | 6 | "Eletrônicos" tem produtos → não pode ser excluída |
| Produtos | 15 | **Teclado Mecânico RGB** estoque 0 · **Caixa de Som Portátil** estoque 2 · **MP3 Player Clássico** inativo e já vendido |
| Clientes | 6 | **Fábio Nunes** não tem pedidos (pode ser excluído) |
| Pedidos | 7 | Todos os status. **Pedido #1** gravou o Fone a R$ 179,90; hoje ele custa R$ 199,90 (RN02) |
| Cupons | 5 | BEMVINDO10, BLACKFRIDAY25, UNEB5 válidos · **NATAL15** expirado · **INATIVO5** desativado |
| Avaliações | 5 | Só de clientes que compraram |

Pedidos: #1 Ana ENTREGUE · #2 Ana ENTREGUE · #3 Bruno ENVIADO (cupom) · #4 Elisa CANCELADO · #5 Carla PAGO · #6 Diego PENDENTE · #7 Bruno PENDENTE (cupom).

## Requisitos atendidos

| Requisito | Onde |
|-----------|------|
| RF01 Manter produtos | `ProdutoController/Service`, telas `produtos` |
| RF02 Manter categorias | `CategoriaController/Service`, telas `categorias` |
| RF03 Catálogo com busca e filtro | `GET /api/produtos?nome=&categoriaId=` (Specification), tela `catalogo` |
| RF04 Carrinho | `CarrinhoService` (signals + localStorage), tela `carrinho` |
| RF05 Finalizar pedido | `POST /api/pedidos` → `PedidoService.finalizar` |
| RF06 Pedidos do cliente | `GET /api/clientes/{id}/pedidos` e `GET /api/pedidos?clienteId=` |
| RF07 Alterar status | `PATCH /api/pedidos/{id}/status` |
| RF08 Cupom (desejável) | entidade `Cupom`, CRUD `/api/cupons`, aplicado no carrinho |
| RF09 Avaliação (desejável) | `/api/produtos/{id}/avaliacoes`, tela de detalhe do produto |
| RF10 Mais vendidos (desejável) | `GET /api/relatorios/mais-vendidos`, tela `relatorios` |
| RN01 Estoque | `PedidoService.finalizar` — valida todos os itens e baixa o estoque na mesma transação |
| RN02 Preço congelado | `ItemPedido.precoUnitario` gravado no construtor |
| RN03 Fluxo de status | `StatusPedido.proximo()/podeCancelar()` + `PedidoService.alterarStatus` |
| RN04 Preço/estoque e inativação | Bean Validation em `ProdutoRequest` + `ProdutoService.excluir` |

**Regras complementares (decisões do grupo):** o status avança **um passo por vez**; cupom com desconto de 1% a 90%; avaliação só por quem comprou o produto (pedido não cancelado), uma vez por cliente; cliente com pedidos e categoria com produtos não podem ser excluídos (409).

## Endpoints

Base: `http://localhost:8080`. Paginação: `page`, `size`, `sort` (ex.: `sort=preco,desc`).

| Método | Endpoint | Descrição | Sucesso |
|--------|----------|-----------|---------|
| GET | /api/categorias | Lista categorias | 200 |
| GET | /api/categorias/{id} | Busca categoria | 200 |
| POST | /api/categorias | Cria categoria | 201 |
| PUT | /api/categorias/{id} | Atualiza categoria | 200 |
| DELETE | /api/categorias/{id} | Exclui (409 se tiver produtos) | 204 |
| GET | /api/produtos?nome=&categoriaId=&ativo= | Lista paginada com filtros | 200 |
| GET | /api/produtos/{id} | Busca produto | 200 |
| POST | /api/produtos | Cria produto | 201 |
| PUT | /api/produtos/{id} | Atualiza produto | 200 |
| DELETE | /api/produtos/{id} | Exclui (204) ou inativa se já vendido (200 + mensagem) | 204/200 |
| GET | /api/produtos/{id}/avaliacoes | Média e lista de avaliações | 200 |
| POST | /api/produtos/{id}/avaliacoes | Avalia produto | 201 |
| GET | /api/clientes?nome= | Lista paginada | 200 |
| GET | /api/clientes/{id} | Busca cliente | 200 |
| GET | /api/clientes/{id}/pedidos | Pedidos do cliente | 200 |
| POST | /api/clientes | Cria cliente | 201 |
| PUT | /api/clientes/{id} | Atualiza cliente | 200 |
| DELETE | /api/clientes/{id} | Exclui (409 se tiver pedidos) | 204 |
| GET | /api/pedidos?clienteId=&status= | Lista paginada | 200 |
| GET | /api/pedidos/{id} | Detalhe com itens | 200 |
| POST | /api/pedidos | Finaliza pedido | 201 |
| PATCH | /api/pedidos/{id}/status | Altera status | 200 |
| GET | /api/cupons | Lista cupons | 200 |
| GET | /api/cupons/{id} | Busca cupom | 200 |
| GET | /api/cupons/codigo/{codigo} | Busca pelo código | 200 |
| POST | /api/cupons | Cria cupom | 201 |
| PUT | /api/cupons/{id} | Atualiza cupom | 200 |
| DELETE | /api/cupons/{id} | Exclui (409 se já usado) | 204 |
| GET | /api/relatorios/mais-vendidos?inicio=&fim=&limite= | Ranking por período | 200 |

### Exemplos de JSON

**Criar produto** — `POST /api/produtos`
```json
{
  "nome": "Headset Gamer",
  "descricao": "Som surround 7.1",
  "preco": 249.90,
  "estoque": 15,
  "imagemUrl": "https://picsum.photos/seed/headset/400/300",
  "categoriaId": 1
}
```

**Finalizar pedido** — `POST /api/pedidos` (o preço NÃO é enviado; o servidor usa o preço atual do produto)
```json
{
  "clienteId": 4,
  "itens": [
    { "produtoId": 1, "quantidade": 2 },
    { "produtoId": 10, "quantidade": 1 }
  ],
  "codigoCupom": "BEMVINDO10"
}
```

**Resposta 201**
```json
{
  "id": 8, "clienteId": 4, "clienteNome": "Diego Santos",
  "dataPedido": "2026-11-24T15:30:00", "status": "PENDENTE",
  "subtotal": 589.70, "desconto": 58.97, "total": 530.73, "codigoCupom": "BEMVINDO10",
  "itens": [
    { "id": 13, "produtoId": 1, "produtoNome": "Fone Bluetooth XZ", "quantidade": 2, "precoUnitario": 199.90, "subtotal": 399.80 },
    { "id": 14, "produtoId": 10, "produtoNome": "Cafeteira Elétrica", "quantidade": 1, "precoUnitario": 189.90, "subtotal": 189.90 }
  ]
}
```

**Alterar status** — `PATCH /api/pedidos/6/status`
```json
{ "status": "PAGO" }
```

**Erro de regra de negócio (409)**
```json
{
  "timestamp": "2026-11-24T15:31:02",
  "status": 409,
  "erro": "Conflict",
  "mensagem": "Não foi possível finalizar o pedido. Estoque insuficiente ou produto indisponível: 'Caixa de Som Portátil': solicitado 5, disponível 2.",
  "caminho": "/api/pedidos"
}
```

**Erro de validação (400)**
```json
{
  "status": 400,
  "erro": "Bad Request",
  "mensagem": "Dados inválidos. Verifique os campos informados.",
  "caminho": "/api/produtos",
  "campos": [
    { "campo": "preco", "mensagem": "O preço deve ser maior que zero." },
    { "campo": "estoque", "mensagem": "O estoque não pode ser negativo." }
  ]
}
```

## Coleção de requisições

`docs/thunder-collection_ecommerce.json` — 48 requisições organizadas por recurso, incluindo os casos de erro (400, 404, 409).
No VS Code: extensão **Thunder Client** → Collections → menu ☰ → **Import** → selecione o arquivo.
Rode as requisições com o backend recém-iniciado (o banco H2 volta ao estado inicial a cada reinício).
