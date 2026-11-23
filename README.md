# 🛒 Loja Virtual (E-commerce) — Sistema Web MVC

Sistema web completo de **E-commerce** desenvolvido para a **Avaliação IV** da disciplina de **Linguagem de Programação III** (Colegiado de Sistemas de Informação — UNEB, Semestre 2026.2)[cite: 1, 4].

O projeto implementa o padrão arquitetural **MVC (Model-View-Controller)**, com separação clara entre API RESTful no backend, camada de regras de negócio, persistência relacional e interface responsiva no frontend[cite: 1, 2, 3].

---

## 👥 Integrantes do Grupo

* **[Nome Completo 1]** — [@usuario-github](https://github.com/usuario-github)
* **[Nome Completo 2]** — [@usuario-github](https://github.com/usuario-github)
* **[Nome Completo 3]** — [@usuario-github](https://github.com/usuario-github)
* **[Nome Completo 4]** — [@usuario-github](https://github.com/usuario-github)
* **[Nome Completo 5]** — [@usuario-github](https://github.com/usuario-github)

**Professor:** Vagner Fonseca[cite: 1]

---

## 🛠️ Tecnologias e Versões

### Backend
* **Java:** [ex.: 17 ou 21]
* **Spring Boot:** [ex.: 3.3.x] (Spring Web, Spring Data JPA, Bean Validation)[cite: 1, 2, 3]
* **Banco de Dados:** [ex.: H2 Database (em memória) / PostgreSQL 16 / MySQL 8][cite: 2]
* **Build Tool:** [ex.: Maven 3.9+ / Gradle]

### Frontend
* **Angular:** [ex.: 18.x][cite: 1]
* **TypeScript:** [ex.: 5.4.x][cite: 2]
* **UI Framework:** [ex.: Angular Material 18.x][cite: 3]
* **Node.js / npm:** [ex.: Node 20.x / npm 10.x]

---

## ✨ Funcionalidades e Regras de Negócio

### Requisitos Funcionais Implementados
* **Catálogo de Produtos (RF01, RF03):** CRUD completo de produtos (nome, descrição, preço, estoque, categoria e URL da imagem), com busca por nome e filtro por categoria[cite: 4].
* **Gestão de Categorias (RF02):** CRUD completo de categorias de produtos[cite: 4].
* **Carrinho de Compras (RF04):** Adição de produtos, ajuste de quantidades, remoção de itens e cálculo dinâmico de subtotais e valor total[cite: 4].
* **Gestão de Pedidos (RF05, RF06, RF07):** Finalização de pedidos vinculados a clientes, histórico detalhado por cliente e transição controlada de status (`PENDENTE` → `PAGO` → `ENVIADO` → `ENTREGUE` ou `CANCELADO`)[cite: 4].
* *(Opcional - Desejáveis)* [Cupons de desconto / Avaliação de produtos / Relatório de mais vendidos][cite: 4].

### Regras de Negócio Garantidas no Backend
* **RN01 — Controle de Estoque:** Impede a finalização de pedidos com quantidade superior ao estoque disponível e realiza a baixa automática ao confirmar a compra[cite: 5].
* **RN02 — Histórico de Preço:** O preço unitário do item é congelado no momento da compra (`ItemPedido`), não sofrendo alteração caso o valor do produto mude futuramente[cite: 5].
* **RN03 — Ciclo de Vida e Cancelamento:** Pedidos só podem ser cancelados nos status `PENDENTE` ou `PAGO` (devolvendo os itens ao estoque). O fluxo de status não retrocede[cite: 5].
* **RN04 — Integridade e Inativação:** Preços devem ser positivos ($> 0$) e estoques não negativos ($\ge 0$). Produtos vinculados a pedidos existentes não são excluídos fisicamente, passando para estado inativo[cite: 5].

---

## 🏗️ Arquitetura do Projeto

```text
├── backend/
│   └── src/main/java/br/uneb/ecommerce/
│       ├── controller/    # Endpoints RESTful (/api/...)[cite: 2, 3]
│       ├── service/       # Regras de negócio (RN01–RN04)[cite: 2, 5]
│       ├── repository/    # Interfaces Spring Data JPA[cite: 2]
│       ├── model/         # Entidades JPA e Enums[cite: 2]
│       ├── dto/           # Objetos de transferência de dados[cite: 2]
│       └── exception/     # Tratamento global (@RestControllerAdvice)[cite: 2, 3]
│
├── frontend/
│   └── src/app/
│       ├── features/      # Módulos por funcionalidade (produtos, categorias, carrinho, pedidos)[cite: 2, 4]
│       └── shared/        # Componentes reutilizáveis (diálogos de confirmação, pipes)[cite: 2, 3]
│
└── docs/
    └── api-collection.json # Coleção de requisições (Thunder Client / Postman)[cite: 4]
