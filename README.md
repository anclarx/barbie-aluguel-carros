<div align="center">

<img src="docs/logo-pinkgo.png" alt="Logo do PinkGo" width="140px"/>

# PinkGo 🚗💖

**Aluguel de carros dos sonhos: escolha o carro, peça crédito e acompanhe o pedido até o contrato.**

![Java](https://img.shields.io/badge/Java-25-ff3eb5?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1-ff3eb5?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-ff3eb5?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-ff3eb5?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-ff3eb5?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-ff3eb5?logo=supabase&logoColor=white)
![Versão](https://img.shields.io/badge/versão-1.0.0-fe64c3)

[Sobre](#-sobre-o-projeto) · [Funcionalidades](#-funcionalidades-principais) · [Tecnologias](#-tecnologias-utilizadas) · [Arquitetura](#-arquitetura) · [Como rodar](#-instalação-e-execução) · [Demonstração](#-demonstração) · [Testes](#-testes)

</div>

---

## 🔗 Links Úteis

- 🎨 [Protótipo e diagramas no Figma](https://www.figma.com/design/a8J6bEbdW48Csi29CXlPRw)
- 📄 [Enunciado do laboratório](docs/Enunciado%20-%20Sistema%20de%20Aluguel%20de%20Carros.pdf) · 📝 [Histórias de usuário](docs/Histórias%20de%20Usuários.pdf)
- 📚 [Guia de implementação](docs/guia-de-implementacao-pinkgo.md)

## 📝 Sobre o Projeto

Laboratório 02 de *Desenvolvimento e Integração de Aplicações Web* (Engenharia de Software, PUC Minas). O desafio era um sistema web para **introduzir, modificar, consultar e cancelar pedidos de aluguel**, com **agentes** avaliando cada pedido do ponto de vista financeiro antes de virar contrato.

No PinkGo, o cliente monta o pedido pela vitrine, os **bancos parceiros respondem sozinhos** à proposta de crédito, o cliente escolhe o financiamento e o **agente da PinkGo** dá o parecer e decide o tipo de contrato. ✨

## ✨ Funcionalidades Principais

- 🔐 Cadastro em etapas, login com JWT e **recuperação de senha por e-mail**
- 🚗 Vitrine por loja e período, só com carros livres (2 cores por modelo)
- 📋 Pedidos: criar, editar, consultar e cancelar, com filtros e paginação
- 🏦 Crédito automático em 3 bancos, cada um com a sua política
- 🧑‍💼 Painel do agente: análise da renda, respostas dos bancos, tipo de contrato e parecer com justificativa
- 🔔 Um aviso por erro de campo, empilhados

## 🛠 Tecnologias Utilizadas

| | |
|---|---|
| 💻 **Front-end** | React 19, React Router 7, TypeScript 6, Tailwind CSS 4, Vite 8 |
| 🖥️ **Back-end** | Java 25, Spring Boot 4.1 (Web MVC, Data JPA, Security + JWT, Validation, Mail), Maven |
| 🗄️ **Banco** | PostgreSQL no Supabase, via Hibernate/JPA |
| ⚙️ **Serviços** | SMTP para e-mails, Photon/OpenStreetMap para endereços, Figma para o design |

## 🏗 Arquitetura

Uma **SPA em React** conversa por JSON com uma **API REST em Spring Boot**, organizada em **MVC por camadas**: os controllers só traduzem HTTP ↔ DTO, as regras ficam nos services e nas entidades, e os repositórios Spring Data falam com o Postgres. Erros seguem o ProblemDetail (RFC 9457), com a mensagem de cada campo.

- **Disponibilidade:** o cliente reserva um *modelo*, e o sistema escolhe um carro livre no período inteiro, com 2 dias de preparação antes e depois de cada locação (`entity/Disponibilidade.java`).
- **Crédito:** uma tarefa agendada responde cada proposta uns 30 s depois, pela política do banco (`service/PoliticaCredito.java`):

  | Banco | Renda mínima | Parcela até | Financia até |
  |---|---|---|---|
  | Aurora | R$ 5.000 | 30% da renda | R$ 30.000 |
  | Celeste | R$ 3.000 (só CLT, servidor ou aposentadoria) | 35% | R$ 15.000 |
  | Brilho | R$ 2.000 | 40% | R$ 50.000 |

| Casos de Uso | Classes |
| :---: | :---: |
| <img src="docs/diagramas/Diagrama de Casos de Uso.png" alt="Diagrama de Casos de Uso" width="380px"> | <img src="docs/diagramas/Diagrama de Classes.png" alt="Diagrama de Classes" width="380px"> |
| **Pacotes** | **Componentes** |
| <img src="docs/diagramas/Diagrama de Pacotes (visão lógica).png" alt="Diagrama de Pacotes" width="380px"> | <img src="docs/diagramas/Diagrama de Componentes.png" alt="Diagrama de Componentes" width="380px"> |
| **Sequência do login** | |
| <img src="docs/diagramas/Diagrama de Sequência — login.png" alt="Diagrama de Sequência do login" width="380px"> | |

<details>
<summary>📡 <b>Rotas da API</b> (clique para abrir)</summary>

<br>

Todas começam com `/api`. 🔒 exige `Authorization: Bearer <token>`: `/clientes/me` e `/pedidos` aceitam só clientes, e `/agentes` só o agente.

| Método | Rota | O que faz |
|---|---|---|
| POST | `/auth/login`, `/auth/esqueci-senha`, `/auth/redefinir-senha` | Login e recuperação de senha |
| POST | `/clientes`, `/clientes/verificacao` | Cadastro e checagem de e-mail, CPF e RG |
| GET, PUT, DELETE 🔒 | `/clientes/me` | Perfil do cliente |
| GET | `/modelos`, `/modelos/{id}`, `/modelos/{id}/locais` | Vitrine e lojas com carro livre |
| GET | `/locais`, `/bancos`, `/tipos-rendimento`, `/enderecos`, `/imagens/**` | Dados de apoio e fotos |
| GET, POST, PUT 🔒 | `/pedidos`, `/pedidos/resumo`, `/pedidos/{id}` | Pedidos do cliente |
| POST 🔒 | `/pedidos/{id}/cancelamento`, `/financiamento`, `/financiamento/desistencia` | Cancelar, escolher o banco ou seguir sem crédito |
| GET 🔒 | `/agentes/me`, `/agentes/pedidos`, `/agentes/pedidos/resumo` | Painel do agente |
| POST 🔒 | `/agentes/pedidos/{id}/aprovacao`, `/negacao` | Parecer: `{"justificativa", "tipoContrato"}` |
| POST 🔒 | `/agentes/pedidos/{id}/inicio-contrato`, `/encerramento` | Andamento do contrato |

</details>

## 🔧 Instalação e Execução

**Pré-requisitos:** Java JDK 25, Node.js 20+ e um projeto no Supabase (região São Paulo, Data API desligada, RLS automático ligado).

1. Clone e instale o front:

   ```bash
   git clone https://github.com/anclarx/barbie-aluguel-carros.git
   cd barbie-aluguel-carros/frontend && npm install
   ```

2. Copie `backend/.env.example` para `backend/.env` e preencha as variáveis abaixo. O front não precisa de nenhuma: o Vite repassa `/api` para o back-end.

3. Rode tudo com o `iniciar.cmd` da raiz (Windows), que liga a API, espera ela responder e liga o front:

   ```powershell
   .\iniciar.cmd
   ```

   Ou em dois terminais: `cd backend` e `.\mvnw.cmd spring-boot:run` (API em **:8080**), depois `cd frontend` e `npm run dev` (site em **:5173**).

Na primeira subida, o Hibernate cria as tabelas e a carga inicial cria 4 lojas, 14 modelos, 56 carros, 3 bancos, os logins abaixo e 5 clientes com históricos de aluguel (veja "Dados iniciais"; a senha de cada um está no `dados-iniciais.json`):

| Papel | E-mail | Senha |
|---|---|---|
| 👩 Cliente | `cliente@pinkgo.dev` | `pinkgo123` |
| 🧑‍💼 Agente | `agente@pinkgo.com` | `agente123` |

<details>
<summary>🌱 <b>Dados iniciais</b>: clientes, históricos de pedidos e agentes</summary>

<br>

Ao ligar, a API também lê o [`backend/src/main/resources/dados-iniciais.json`](backend/src/main/resources/dados-iniciais.json) e cria quem ainda não existe (pelo e-mail). Assim, quem configura um Supabase novo já recebe tudo no primeiro `iniciar.cmd`, e reiniciar não duplica nada. O formato completo está no [`dados-iniciais.exemplo.json`](backend/src/main/resources/dados-iniciais.exemplo.json):

- **agentes:** `nome`, `email`, `senha`;
- **clientes:** `nome`, `email`, `senha`, `cpf` (válido), `rg`, `endereco`, `profissao`, `rendimentos` (1 a 3, com `tipo`, `entidadeEmpregadora` e `valorMensal`) e `pedidos`;
- **pedidos:** `modelo` (nome do catálogo), `lojaRetirada` e `lojaDevolucao` (bairro ou cidade), `retirada`, `entrega`, `solicitadoEm`, `status` (padrão: em análise), `tipoContrato`, `justificativa` e `credito`, com as `propostas` de cada banco (`aprovada` vazio = o banco ainda responde) e o `bancoEscolhido`.

O carro de cada pedido é escolhido pela regra de disponibilidade, na ordem do arquivo. Se um registro tiver problema (CPF inválido, loja inexistente, carro ocupado), só ele fica de fora, e o motivo aparece no log.

**Como a carga se comporta a cada subida:**

- 🆕 **Supabase novo:** o primeiro `iniciar.cmd` cria tudo, inclusive os 5 clientes com os 21 pedidos.
- 🔁 **Nas próximas vezes:** quem já existe (pelo e-mail) é pulado, então nada duplica.
- ✏️ **O que muda pelo site fica:** pedidos cancelados, pareceres e perfis editados não são sobrescritos.
- 📄 **Mudar no arquivo um cliente que já existe não tem efeito:** o arquivo só vale para e-mails novos.
- 🗑️ **Conta excluída pelo site volta** com o histórico original na próxima subida.
- ⏳ **Os status não andam com o tempo:** um contrato "em execução" continua assim até um agente encerrar.
- 🧪 **Os testes do back-end também ligam a API**, então rodar `mvnw test` num banco vazio já faz a carga.
- 🧹 **Para recomeçar do zero**, limpe o banco (abaixo) e ligue a API de novo.

Para limpar, use o **SQL Editor** do Supabase. O `TRUNCATE` não tem como desfazer.

- **Só clientes e pedidos** (o catálogo fica; a carga recria os clientes do arquivo):

  ```sql
  TRUNCATE propostas_credito, pedidos, rendimentos, tokens_redefinicao_senha, clientes RESTART IDENTITY CASCADE;
  ```

- **Tudo** (a carga recria catálogo, bancos, agente e clientes):

  ```sql
  TRUNCATE propostas_credito, pedidos, rendimentos, tokens_redefinicao_senha, clientes,
    agentes, automoveis, modelo_fotos, modelos, locais, bancos RESTART IDENTITY CASCADE;
  ```

</details>

<details>
<summary>🔑 <b>Variáveis de ambiente</b> do <code>backend/.env</code></summary>

<br>

| Variável | Para quê | Exemplo |
|---|---|---|
| `DB_URL` | JDBC do Supabase (Connect › JDBC › Session pooler) | `jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require` |
| `DB_USER`, `DB_PASSWORD` | Usuário e senha do banco | `postgres.<id-do-projeto>` |
| `JWT_SECRET` | Chave dos tokens (32+ caracteres) | gere com o comando abaixo |
| `CORS_ORIGENS`, `FRONT_URL` | Endereço do front | `http://localhost:5173` |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` | SMTP do "esqueci a senha". Sem `MAIL_HOST`, o link sai no log | `smtp.gmail.com`, `587` |

```powershell
$b = New-Object byte[] 48; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
```

No Gmail, use uma **senha de app** (myaccount.google.com/apppasswords), não a senha da conta.

</details>

## 🚀 Deploy

Ainda não publicado. Os artefatos saem com `npm run build` (gera `frontend/dist`) e `.\mvnw.cmd clean package` (gera `backend/target/backend-0.0.1-SNAPSHOT.jar`). Em produção, basta configurar as mesmas variáveis do `.env` e servir o `dist` com `/api` apontando para a API. Não usamos Docker: o banco já está na nuvem.

## 📂 Estrutura de Pastas

```
.
├── iniciar.cmd                     ▶️ liga a API, espera ela responder e liga o front (Windows)
├── README.md
│
├── backend/                        ☕ API Spring Boot (MVC em camadas)
│   ├── .env.example                🧩 variáveis de ambiente, sem valores reais
│   ├── pom.xml                     📦 dependências (Maven)
│   └── src/
│       ├── main/java/br/pucminas/pinkgo/
│       │   ├── PinkGoApplication.java
│       │   ├── controller/         🎮 rotas REST: Auth, Cliente, Catalogo, Pedido, Agente, Endereco
│       │   ├── service/            ⚙️ regras e transações: pedidos, clientes, parecer do agente,
│       │   │                          crédito (PoliticaCredito, SimuladorFinanciamento, resposta
│       │   │                          automática agendada), senha e e-mail (SMTP ou log)
│       │   ├── repository/         🗄️ Spring Data JPA, com as consultas de disponibilidade
│       │   ├── entity/             🧬 Cliente, Rendimento, Modelo, Automovel, Local, Pedido,
│       │   │                          PropostaCredito, Banco, Agente, enums e a regra de Disponibilidade
│       │   ├── dto/                ✉️ records de entrada e saída (a API nunca expõe entidades)
│       │   ├── security/           🛡️ JWT, papéis e @UsuarioLogado
│       │   ├── config/             🔧 segurança, CORS, e-mail, imagens, DataLoader (catálogo)
│       │   │                          e CargaDadosIniciais (clientes e pedidos do JSON)
│       │   ├── exception/          💥 erros de domínio e ProblemDetail com erro por campo
│       │   └── validation/         ✅ @Cpf e normalização de CPF e RG
│       ├── main/resources/
│       │   ├── application.yml     ⚙️ configuração (lê o .env)
│       │   ├── dados-iniciais.json 🌱 clientes, históricos e agentes da carga
│       │   └── imagens/carros/     🖼️ fotos dos modelos (modelo-cor)
│       └── test/java/              🧪 unidade (services, política, CPF) e integração (API e carga)
│
├── frontend/                       ⚛️ SPA React + Vite
│   ├── vite.config.ts              🔀 proxy de /api para a API
│   ├── public/                     🔤 fontes (Quicksand, Dollie Script) e imagens fixas
│   └── src/
│       ├── App.tsx                 🧭 rotas (cliente, agente e visitante)
│       ├── index.css               🎨 tokens do Figma: cores, tipografia e espaçamentos
│       ├── types.ts                🏷️ tipos espelhando os DTOs da API
│       ├── pages/                  📄 Home, Login, Cadastro, EsqueciSenha, RedefinirSenha,
│       │                              MeusPedidos, Perfil e PainelAgente
│       ├── components/
│       │   ├── ui/                 🧱 Button, Field, Modal, Badge, Toast, Pagination, Stepper…
│       │   ├── layout/             🏠 Header, Footer e layouts com proteção de rota
│       │   ├── carros/             🚗 vitrine, busca, filtros e cartão do carro
│       │   ├── pedidos/            📋 novo, editar, detalhes, cancelar e escolher financiamento
│       │   ├── cliente/            👤 endereço com sugestões e rendimentos
│       │   └── agente/             🧑‍💼 modal de análise financeira
│       ├── services/               🔌 http.ts (token e erros) e um service por recurso da API
│       ├── hooks/                  🎣 hooks de dados (usePedidos, useAgente…) e de sessão
│       ├── context/                🔐 sessão (AuthProvider) e avisos (ToastProvider)
│       └── lib/                    🛠️ funções puras: formatação, máscaras, crédito, situações
│
└── docs/
    ├── diagramas/                  📐 diagramas UML exportados do Figma
    ├── demonstracao/               🎥 vídeo do sistema em uso
    └── guia-de-implementacao-pinkgo.md, enunciado e histórias de usuário (PDF)
```

## 🎥 Demonstração

<!--
  Vídeo: edite este README no site do GitHub, arraste o docs/demonstracao/pinkgo-demo-readme.mp4 (8,6 MB; o
  GitHub aceita até 10 MB) para cá e troque a linha abaixo pelo link https://github.com/user-attachments/assets/...
  que o GitHub gerar.
-->

https://github.com/user-attachments/assets/COLE-AQUI-O-LINK-DO-VIDEO

🎞️ Em qualidade cheia: [docs/demonstracao/pinkgo-demo.mp4](docs/demonstracao/pinkgo-demo.mp4)

## 🧪 Testes

```powershell
cd backend
.\mvnw.cmd test
```

JUnit 5, Mockito e MockMvc. São testes de **unidade** (regras de pedido e cliente, política dos bancos, simulador, senha, e-mail, CPF) e de **integração** (login, papéis, erros por campo, disponibilidade e o fluxo do crédito até o contrato). Cada teste roda numa transação desfeita, então nada fica no banco. No front, `npm run lint` e `npm run build` conferem o código e os tipos.

## 🔗 Documentações utilizadas

[React](https://react.dev/reference/react) · [Vite](https://vite.dev/config/) · [Tailwind CSS](https://tailwindcss.com/docs) · [Spring Boot](https://docs.spring.io/spring-boot/) · [Spring Security](https://docs.spring.io/spring-security/reference/) · [Supabase](https://supabase.com/docs) · [Engenharia de Software Moderna, cap. 4](https://engsoftmoderna.info/cap4.html) · [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/)

## 📄 Licença

Projeto acadêmico, sem licença de uso definida. Todos os direitos reservados às autoras e aos autores. 🎀
