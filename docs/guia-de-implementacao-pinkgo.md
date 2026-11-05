# Guia de Implementação e Especificação Técnica: Sistema PinkGo (Aluguel de Carros)

> **Versão atualizada com a implementação e o enunciado do Lab 02.** Reflete o que está no código hoje: back-end Spring Boot ligado ao Supabase, front React sem dados de mentira, regra de disponibilidade por período, bancos que respondem sozinhos e o design atual do Figma (arquivo "Aluguel de Carros", páginas "Page 1" e "Diagramas UML"). Instruções para rodar o projeto ficam no `README.md` da raiz.

---

## 1. Documentação e Regras do Projeto (PRD & Governança)

O **Sistema de Aluguel de Carros (PinkGo)** é uma plataforma web voltada para a gestão e contratação de aluguéis de veículos com análise financeira e intermediação de crédito bancário, atendendo aos requisitos do **Lab 02 de Engenharia de Software (PUC Minas)** em arquitetura MVC em Java.

### 1.1 Escopo das Sprints

- **Sprint 01 (Modelagem)**:
  - Diagrama de Casos de Uso (atores: Visitante, Cliente, Agente da PinkGo e Banco parceiro como sistema automático) — _no Figma_.
  - Diagrama de Classes de Domínio — _no Figma_.
  - Diagrama de Pacotes (Visão Lógica em Camadas) — _no Figma_.
  - Histórias de Usuário completas com regras de aceitação (`docs/Histórias de Usuários.pdf`).
- **Sprint 02 (Fundação e CRUD)** — _implementada_:
  - Diagrama de Componentes do Sistema — _no Figma_.
  - Arquitetura MVC em Java (Spring Boot 4, Java 25) com banco relacional (PostgreSQL no Supabase).
  - CRUD completo de Clientes (com até 3 fontes de rendimento), login com JWT e "esqueci a senha" por e-mail.
- **Sprint 03 (Protótipo Funcional Avaliativo)** — _implementada_:
  - Catálogo público filtrado por loja e período, mostrando só modelos com carro livre.
  - Criação de pedidos pelo cliente com cálculo automático de diárias e simulação de crédito em bancos parceiros.
  - Reserva automática de um automóvel do modelo, respeitando a regra de disponibilidade (seção 5.4).
  - Acompanhamento, edição e cancelamento dos pedidos pelo cliente.
- **Pós-Protótipo (Fluxo Completo)** — _em andamento_:
  - Painel do agente da PinkGo com o parecer da análise financeira e justificativa — _implementado_.
  - Resposta automática dos bancos (política de crédito por banco) e escolha do financiamento pelo cliente — _implementado_.
  - Início e encerramento do contrato pelo agente — _implementado_.
  - Tipo de contrato escolhido pelo agente na aprovação (`ParecerRequest.tipoContrato`; propriedade do banco só com financiamento) — _feito_. Transição de propriedade do bem depois da quitação — _fora do escopo_.
  - Data de nascimento do cliente — _em avaliação_.

### 1.2 Requisitos do Enunciado (Lab 02 · DIAW · Prof. João Paulo Aramuni)

- **Stack**: Java (JDK 25), Spring Boot 4.0.x, Apache Maven, React + Vite, Supabase (PostgreSQL) e login obrigatório (usuário e senha).
- **Sistema**: só pode ser usado depois de cadastro e login. Clientes introduzem, modificam, consultam e cancelam pedidos; agentes (empresas e bancos) modificam e avaliam pedidos. Os pedidos passam por análise financeira dos agentes e, com parecer positivo, seguem para execução do contrato.
- **Dados do contratante**: RG, CPF, nome, endereço, profissão, entidades empregadoras e rendimentos (no máximo 3).
- **Automóveis**: matrícula, ano, marca, modelo e placa. Conforme o tipo de contrato, ficam registrados como propriedade do cliente, da empresa ou do banco. O aluguel pode ter um contrato de crédito concedido por um dos bancos agentes.
- **Subsistemas**: gestão de pedidos e contratos (API Spring Boot) e construção dinâmica das páginas web (React).
- **Processo**: modelagem (casos de uso, histórias, classes e pacotes), autenticação, CRUD de cliente, protótipo (criar e acompanhar pedidos) e revisão dos diagramas ao longo do projeto.
- **Avaliação final**: qualidade do sistema, alinhamento entre modelo (classes e arquitetura) e código, e atualização dos modelos. O README segue o template do professor (`TEMPLATES/template_README.md`), que pede na seção Arquitetura diagramas de componentes, modelo de dados, fluxo de autenticação, infraestrutura e mapa de endpoints.

### 1.3 Regras de Governança Técnica (`regras.md`)

1. **Padrão Arquitetural**: Separação estrita em camadas: `controller`, `service`, `repository`, `entity`, `dto`, `config`, `security` e `exception`. Proibida regra de negócio em controllers; a API nunca expõe entidades, só DTOs.
2. **Segurança**: Senhas salvas com BCrypt. Credenciais (banco, JWT, SMTP) ficam no `backend/.env`, que não vai para o git; o modelo é o `backend/.env.example`.
3. **Ambiente único**: um só banco, o Supabase, para usar o sistema e para os testes. Os testes de integração rodam cada um numa transação desfeita no fim, então não deixam dados.
4. **Rastreabilidade**: Nomes de entidades, atributos e métodos de domínio devem corresponder com fidelidade aos diagramas UML aprovados.
5. **Verificabilidade**: Cada funcionalidade tem testes automatizados (`./mvnw test`) e passos no roteiro manual da seção 6.

---

## 2. Identidade Visual da Interface (`design.md`)

### 2.1 Conceito e Tom de Design

- Estética **Barbie**: vibrante, lúdica, acessível e moderna, com muito rosa, cantos arredondados e ilustrações de carros em estilo de brinquedo.
- Layout limpo com respiro generoso: página em fundo cinza muito claro, conteúdo em cartões brancos com borda rosa suave e forte hierarquia tipográfica.
- Interface pensada para **desktop** (largura de referência de **1440 px**, margens laterais de **64 px**, conteúdo útil de 1312 px).
- Os tokens abaixo são os mesmos do Figma e do `frontend/src/index.css` (Tailwind 4 com `@theme`). Devem ser usados pelo nome, nunca como valor solto.

### 2.2 Guia de Estilo (Tokens de Design)

#### Paleta de cores

| Token (Figma)            | Valor     | Uso                                                                                                     |
| :----------------------- | :-------- | :------------------------------------------------------------------------------------------------------ |
| `Brand/Primary`          | `#FF3EB5` | Ação principal: botões preenchidos, links, ícones ativos, item selecionado, borda de botões secundários |
| `Brand/Primary Hover`    | `#E0299B` | Hover/pressionado dos botões e links rosa                                                               |
| `Brand/Pink`             | `#FE64C3` | Detalhes decorativos e ilustrações                                                                      |
| `Brand/Pink Soft`        | `#FFE4F3` | Fundo de etiquetas rosa, hover de botões secundários e selo do ícone de sucesso no aviso                |
| `Neutral/Border`         | `#E2C8D8` | Bordas de cartões, campos, modais, cabeçalho, rodapé e divisórias                                       |
| `Neutral/Text`           | `#1A1A1A` | Títulos, valores e textos principais                                                                    |
| `Neutral/Secondary Text` | `#757575` | Rótulos, textos de apoio e placeholders                                                                 |
| `Neutral/White`          | `#FFFFFF` | Cartões, modais, cabeçalho e rodapé                                                                     |
| `Neutral/Page`           | `#F7F7F7` | Fundo geral das telas e dos blocos de características no verso do cartão do carro                       |

Todas as cores do Figma são variáveis da coleção **Colors** (incluindo `Neutral/Page`, criada para o fundo da página). Nas telas e nos diagramas, os preenchimentos e bordas ficam ligados a essas variáveis e os textos aos estilos de texto da seção abaixo: mudar um token no Figma muda tudo o que o usa.

#### Cores de status (selo do pedido)

Cada selo é uma pílula com fundo claro e texto escuro da mesma família. Na lista de pedidos o texto é `Caption/Bold`; no cabeçalho dos modais de pedido, `Label/Bold`, um pouco maior.

| Status                | Fundo     | Texto     | Tokens               |
| :-------------------- | :-------- | :-------- | :------------------- |
| Em análise financeira | `#FFF4E5` | `#B86E00` | `Status/Warning/*`   |
| Aprovado              | `#E6F7ED` | `#0D8A4B` | `Status/Success/*`   |
| Contrato em execução  | `#E5F0FF` | `#1D4ED8` | `Status/Info/*`      |
| Contrato encerrado    | `#F0E8FF` | `#6941C6` | `Status/Completed/*` |
| Negado                | `#FDE8E8` | `#B42318` | `Status/Danger/*`    |
| Cancelado             | `#F0F1F3` | `#4B5563` | `Status/Inactive/*`  |

O botão destrutivo "Cancelar" (nos pedidos) usa borda e texto em `Status/Danger/Text` (`#B42318`).

#### Tipografia

- **Corpo e interface**: família **Quicksand** (sem serifa, arredondada), pesos _Medium_, _SemiBold_ e _Bold_.
- **Logotipo "PinkGo"**: fonte cursiva _Dollie Script_ (somente no logo, 40 px no cabeçalho e 48 px no rodapé). A versão usada é "Personal Use": serve para o trabalho acadêmico, mas exigiria licença comercial em produção.

Os estilos seguem o padrão `Categoria/Peso`. No front, cada estilo vira uma classe com o mesmo nome (ex.: `Body/Bold` → `.text-body-bold`).

| Estilo (Figma)     | Fonte                      | Tamanho | Uso                                                                  |
| :----------------- | :------------------------- | :------ | :------------------------------------------------------------------- |
| `Display/Medium`   | Quicksand Medium           | 48 px   | Números de destaque dos cartões do painel                            |
| `Heading/Bold`     | Quicksand Bold             | 24 px   | Título da página                                                     |
| `Body/Medium`      | Quicksand Medium           | 16 px   | Texto padrão, valores, campos                                        |
| `Body/Bold`        | Quicksand Bold             | 16 px   | Botões, títulos de seção e de modal, nome do carro                   |
| `Body/Link`        | Quicksand Bold, sublinhado | 16 px   | Links rosa ("Ver detalhes", "Cadastre-se", "Entrar")                 |
| `Label/Medium`     | Quicksand Medium           | 14 px   | Rótulos auxiliares, resumo, valores das características do carro     |
| `Label/Bold`       | Quicksand Bold             | 14 px   | Destaques do resumo, selo de status no cabeçalho dos modais, avisos  |
| `Caption/Medium`   | Quicksand Medium           | 12 px   | Linha de contexto do modal ("Pedido #P12"), rótulos das características |
| `Caption/SemiBold` | Quicksand SemiBold         | 12 px   | Etiquetas                                                            |
| `Caption/Bold`     | Quicksand Bold             | 12 px   | Selos de status na lista                                             |
| `Logo/Header`      | Dollie Script              | 40 px   | Logo no cabeçalho                                                    |
| `Logo/Footer`      | Dollie Script              | 48 px   | Logo no rodapé                                                       |

#### Formas, espaçamento e componentes

- **Raio**: `12 px` para cartões, modais e contêineres; `8 px` para campos de formulário e botões de data; `4 px` para o checkbox; `60 px` (pílula) para todos os botões e selos.
- **Borda**: 1 px em `Neutral/Border`. Item selecionado: borda `Brand/Primary` de 2 px.
- **Sombras**: não são usadas, exceto nos avisos (toasts) e nos menus suspensos. A separação vem das bordas.
- **Cabeçalho** (64 px): logo à esquerda; navegação central com _Início_, _Meus aluguéis_ e _Meu perfil_ (para o cliente) ou _Painel do agente_ (para o agente); ícones de suporte e acessibilidade à direita. O item da tela atual fica em `Brand/Primary` e os demais em `Neutral/Text`.
- **Rodapé** (200 px): logo, colunas "Alugue" e "Ajuda", contato, redes sociais e direitos reservados.
- **Botão primário**: pílula preenchida com `Brand/Primary`, texto branco em negrito, altura de 38 px, padding horizontal de 28 px.
- **Botão secundário**: pílula com fundo transparente, borda e texto em `Brand/Primary`, padding horizontal de 20 px.
- **Links**: os rosa ("Cadastre-se", "Entrar", "Reenviar") escurecem para `Brand/Primary Hover` no hover; os cinza sublinhados ("Termos de Uso", "Política de Privacidade") ficam pretos (`Neutral/Text`).
- **Campo de formulário**: rótulo em `Neutral/Secondary Text` acima, caixa de 46 px com borda `Neutral/Border`, raio 8 px. A mensagem de erro aparece embaixo do campo, em `Status/Danger/Text`. CPF, RG e valores em reais têm máscara.
- **Avisos (toasts)**: cartão branco no canto inferior direito, com selo redondo do ícone na cor do tipo (sucesso em rosa, erro em vermelho, aviso em azul) e uma barra fina que esvazia com o tempo (5 s; erros, 8 s). Vários avisos se empilham; com o mouse em cima, a pilha abre em lista e o tempo pausa. Todo erro de formulário aparece embaixo do campo **e** num aviso: um aviso por campo com erro, com o nome do campo no título, empilhados na ordem do formulário.
- **Checkbox**: quadrado de 20 px, raio 4 px, preenchido com `Brand/Primary` e ícone de check branco.
- **Etiqueta rosa**: pílula com fundo `Brand/Pink Soft` e texto `Brand/Primary` (ex.: "Rendimento 1").
- **Paginação**: botões "Anterior" e "Próximo" secundários; página atual em pílula preenchida `Brand/Primary`. A vitrine mostra 9 carros por página e "Meus aluguéis", 5 pedidos.
- **Ícones**: biblioteca própria com prefixo `Icone/` (Casa, Lista, Usuário, Calendário, Check, Fechar, Seta, Volante, Gasolina, Assento, Carro, Chave, Cofrinho, entre outros), de traço fino e cor `Neutral/Text` ou `Brand/Primary`.

#### Cartão do carro (vitrine)

- **Frente**: foto (passa para as próximas com o mouse em cima), marca e ano, nome, diária, botão "Alugar" e link "Ver detalhes".
- **Verso**: "Ver detalhes" vira o cartão em 3D (como nos grupos de carros da Localiza). Mostra marca, ano e nome centralizados e seis blocos com ícone rosa em fundo `#F7F7F7`, dois por linha: combustível, câmbio, assentos, carroceria, porta-malas e seguro. "Esconder detalhes" desvira. Os dois lados têm a mesma altura.
- A placa nunca aparece na vitrine (US16).

#### Modais

- Modal centrado com **backdrop fosco**, cartão branco, borda `Neutral/Border` e raio 12 px.
- **Cabeçalho do modal** (60 px): título em `Body/Bold` com a linha de contexto em `Caption/Medium` acima; botão de fechar em cruz ("X") à direita; divisor inferior. Nos modais de pedido (detalhes, editar, cancelar), o selo de status fica à esquerda do título e o contexto é o código do pedido ("Pedido #P12").
- **Modais de duas colunas** (novo pedido e editar pedido): a coluna da esquerda rola junto com o modal, sem barra de rolagem visível, e a da direita (resumo e botões) fica parada.
- **Rodapé do modal** (63 px): divisor superior, botões alinhados à direita. Botão secundário à esquerda ("Voltar" ou "Cancelar") e ação principal em destaque à direita.
- Larguras: 864 px para modais de conteúdo rico (novo pedido, editar pedido, detalhes do pedido), 640 px para o perfil e 520 px para confirmação.
- Nos modais, as características do carro (seguro, porta-malas, carroceria) ficam numa linha, em três colunas de mesma largura.

#### Stepper

- **Status do pedido** (barra linear): _Pedido enviado_ → _Análise financeira_ → _Aprovação_ → _Contrato em execução_. Etapa concluída: círculo `Brand/Primary` com check. Etapa atual: círculo com borda `Brand/Primary`. Etapas futuras: círculo com borda `Neutral/Border` e texto cinza. Conectores finos de 2 px.
- **Cadastro** (3 passos, no topo do formulário): _Acesso_ → _Dados_ → _Renda_, com ícone por passo, linha de 2 px entre eles e check no passo concluído.

### 2.3 Telas e Modais

| Tela / modal                      | Conteúdo principal                                                                                                                                                         |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Início**                        | Banner com o card de busca (loja de retirada e de devolução, datas); depois da busca, a vitrine com filtros laterais (marca, tipo, câmbio, combustível, pessoas, ano, preço) e os cartões que viram; antes dela, "Como funciona" e perguntas frequentes |
| **Login**                         | E-mail e senha, "Manter logado", "Esqueceu sua senha?" e "Cadastre-se". Clientes e agentes entram pela mesma tela                                                          |
| **Cadastro em 3 passos**          | Passo 1 acesso (e-mail e senha) · Passo 2 dados pessoais (nome, CPF, RG, endereço com busca de endereço) · Passo 3 profissão e rendimentos (até 3) · tela de sucesso. Cada passo confere seus dados no servidor antes de avançar |
| **Esqueci a senha / Nova senha**  | Pede o e-mail e manda o link por e-mail; o link abre a tela de nova senha                                                                                                 |
| **Meus aluguéis**                 | Cartões-resumo por situação (Todos, Em análise, Aprovados, Em execução, Histórico); lista paginada com selo, dados do aluguel e ações "Detalhes", "Editar" e "Cancelar"   |
| **Menu Meu perfil**               | Nome e e-mail do usuário, "Editar dados cadastrais" (só cliente) e "Sair"                                                                                                  |
| **Editar dados cadastrais**       | Cartões Acesso (e-mail e alterar senha), Dados pessoais e Profissão e rendimentos; botões "Excluir conta", "Cancelar" e "Salvar alterações"                              |
| **Painel do agente**              | "Meus aluguéis" de quem recebe os pedidos: cartões por situação, lista com cliente e renda e o modal **Análise do pedido** (cliente, carro, crédito, peso na renda, justificativa; aprovar/negar, iniciar e encerrar contrato). No Figma ("Page 1"), o implementado é o "Modal análise financeira v2", com a variação "cliente escolheu o banco". Ele traz RG ao lado do CPF, peso na renda fora dos cartões, escolha do **tipo de contrato** pelo agente e respostas dos bancos detalhadas |
| **Novo pedido** (modal)           | Carro escolhido, lojas e período, forma de liquidação (à vista ou crédito em um ou mais bancos, com simulação) e resumo com "Enviar pedido para análise". Sem login, o botão vira "Entrar para enviar o pedido" e "Criar conta" |
| **Detalhes do pedido** (modal)    | Selo de status, stepper de andamento, carro, placa e tipo de contrato, resumo do aluguel                                                                                   |
| **Editar pedido** (modal)         | Carro, placa, lojas, novo período, forma de liquidação e resumo com total recalculado                                                                                      |
| **Cancelar pedido** (modal)       | Pergunta de confirmação, carro com placa e diária, aviso de irreversibilidade e botões "Voltar" e "Sim, cancelar pedido"                                                   |

---

## 3. Modelagem de Domínio e Relacional (Sprint 01)

### 3.1 Entidades Principais

1. **Cliente**:
   - `id`: Long (PK)
   - `nome`: String
   - `cpf`: String (único, validado pelos dígitos verificadores)
   - `rg`: String (único)
   - `endereco`: String
   - `profissao`: String
   - `email`: String (único entre clientes **e** agentes, porque o login é um só)
   - `senha`: String (BCrypt)
   - `rendimentos`: List<Rendimento> (de 1 a 3)
2. **Rendimento**:
   - `id`: Long (PK)
   - `tipo`: Enum (`EMPREGO_CLT_PUBLICO`, `PJ_MEI`, `AUTONOMO`, `APOSENTADORIA`, `ALUGUEL`, `INVESTIMENTO`, `OUTRO`)
   - `entidadeEmpregadora`: String (ou razão social/área de atuação conforme o tipo)
   - `valorMensal`: BigDecimal
   - `cliente_id`: Long (FK)
3. **Agente** (sem cadastro pelo site; criado pela carga inicial):
   - `id`, `nome`, `email` (único), `senha` (BCrypt)
   - `tipo`: Enum (`EMPRESA`, `BANCO`)
   - `banco_id`: Long (FK, só para agente de banco)
4. **Local** (loja da PinkGo, onde o carro é retirado e devolvido):
   - `id`: Long (PK)
   - `bairro`, `cidade`, `uf`: String
5. **Modelo** (o que o cliente aluga e o que aparece no cartão da vitrine):
   - `id`: Long (PK)
   - `marca`, `nome`: String
   - `ano`: Integer
   - `diaria`: BigDecimal
   - `cambio`, `combustivel`: String
   - `assentos`, `portas`: Integer
   - `seguro`: String
   - `portaMalas`: String _(em litros, ex.: "240 L")_
   - `carroceria`: String _(ex.: Conversível, SUV, Esportivo, Clássico, Hatch)_
   - `imagemUrl`: String _(foto principal, recortada)_
   - `fotos`: List<String> _(fotos extras, que passam no cartão)_
   - As fotos ficam no back-end (`backend/src/main/resources/imagens`) e a API devolve a URL completa (`/api/imagens/...`).
   - A cor saiu do modelo: o cliente reserva o modelo, não um carro específico.
6. **Automóvel** (um carro da frota):
   - `id`: Long (PK)
   - `matricula`: String (única)
   - `placa`: String (única) _(nunca aparece na vitrine; só nos pedidos)_
   - `modelo_id`: Long (FK)
   - `local_id`: Long (FK, loja onde o carro fica)
   - Não guarda se está livre: isso depende do período e é calculado pelos pedidos (seção 5.4).
7. **Pedido**:
   - `id`: Long (PK); o código mostrado na tela é `P` + id (ex.: "P12")
   - `cliente_id`, `modelo_id`, `automovel_id`: Long (FK)
   - `localRetirada_id`, `localDevolucao_id`: Long (FK)
   - `dataSolicitacao`, `dataRetirada`, `dataEntrega`: LocalDate
   - `comCredito`: Boolean
   - `totalEstimado`: BigDecimal
   - `status`: Enum (`EM_ANALISE_FINANCEIRA`, `APROVADO`, `CONTRATO_EM_EXECUCAO`, `NEGADO`, `CANCELADO`, `CONTRATO_ENCERRADO`)
   - `tipoContrato`: Enum (`PROPRIEDADE_CLIENTE`, `PROPRIEDADE_EMPRESA`, `PROPRIEDADE_BANCO`)
   - `bancoAssociado`: String (banco que o cliente escolheu para financiar)
   - `justificativaParecer`: String (opcional, até 500 caracteres)
   - `propostas`: List<PropostaCredito>
8. **Banco** (parceiro que financia o aluguel):
   - `id`, `nome`
   - `jurosMensal`: BigDecimal (% ao mês)
   - `parcelasMaximas`: int (as opções vão de 6 em 6 até o máximo)
   - `entradaMinima`: BigDecimal (% do total)
9. **PropostaCredito** (um banco escolhido num pedido com crédito):
   - `id`, `pedido_id`, `banco_id`
   - `parcelas`: int
   - `status`: Enum (`EM_ANALISE`, `APROVADA`, `NEGADA`)
   - `enviadaEm`: Instant (o banco responde uns 30 s depois)
   - `motivo`: String (por que o banco aprovou ou negou)
   - A simulação (entrada, valor financiado, parcela pela Tabela Price, juros e total) é calculada, não guardada.
10. **TokenRedefinicaoSenha**:
    - `id`, `cliente_id`
    - `tokenHash`: String (só o SHA-256 do token; o token em si vai apenas no e-mail)
    - `expiraEm`, `usadoEm`: Instant

> Os seis valores de `status` do pedido têm um selo próprio na paleta da seção 2.2. O card "Histórico" do painel soma `CONTRATO_ENCERRADO`, `CANCELADO` e `NEGADO`.

### 3.2 Diagramas UML (Figma, página "Diagramas UML")

Os diagramas ficam no arquivo do Figma "Aluguel de Carros", na página **Diagramas UML**, um quadro por diagrama, com as cores e os estilos de texto do design system. Seguem o modo **esboço** do capítulo 4 de *Engenharia de Software Moderna* (Marco Tulio Valente), referência do enunciado: mostram o essencial e são revisados conforme o código muda.

| Diagrama | O que mostra | Convenções |
| :-- | :-- | :-- |
| **Casos de Uso** | Visitante (catálogo, cadastro), Cliente (login, senha, pedidos US03–US06, financiamento, perfil US07), Agente da PinkGo (login, parecer, tipo de contrato, contrato) e Banco parceiro como «sistema» (análise de crédito, «extend» de "Introduzir pedido") | Ator em boneco; caso de uso em elipse dentro da fronteira do sistema; associação contínua; «extend» tracejado |
| **Classes** | As 10 entidades do pacote `entity` com atributos e métodos de negócio, e os 4 enums | Seta = associação navegável, com o nome do atributo e a multiplicidade na ponta (ex.: `rendimentos 0..3`, `automovel 0..1`); getters, setters e ids omitidos |
| **Pacotes** (visão lógica) | `frontend` (pages, components, hooks, context, services, lib) e `backend` MVC (controller, service, repository, entity, dto, security, exception, config) | Pacote com aba; seta tracejada = dependência ("usa"); o front depende do back pela API HTTP |
| **Componentes** | Os dois subsistemas do enunciado: navegador (SPA React, Vite) e API Spring Boot (autenticação, clientes, catálogo, pedidos, painel do agente, análise de crédito, e-mail, imagens, persistência), mais Supabase, SMTP e Photon | «component» com ícone; «database» e «external» para o que está fora; conectores com o protocolo (REST/JSON + JWT, JDBC, SMTP, HTTP) |
| **Sequência — login** | O fluxo de autenticação do template do professor, da tela de login ao JWT salvo no navegador, com o fragmento `alt` das credenciais inválidas (401) | Chamada contínua, retorno tracejado, linha de vida tracejada |

Para manter o alinhamento modelo × código (critério da avaliação), toda mudança em entidade, pacote ou fluxo deve vir com a atualização do quadro correspondente.

---

## 4. Persistência e Dados Iniciais (Seed)

### 4.1 Carga Inicial (`DataLoader.java`)

O banco é o PostgreSQL do Supabase. As tabelas são criadas pelo Hibernate (`ddl-auto: update`). A cada subida, a carga inicial confere o banco e cria só o que falta, sem duplicar:

- **Com o banco vazio, o catálogo**:
  - 4 lojas: Belo Horizonte (Savassi), São Paulo (Pinheiros), Goiânia (Setor Bueno) e Fortaleza (Aldeota).
  - 14 modelos, cada um com 2 variações de cor: _DreamMotors Pegasus Cabrio 2024_ (R$ 1.000,00/dia), _Malibu Auto Sunset GT 2023_ (R$ 560,00), _Lilac Spyder 2021_ (R$ 270,00), _Coast 4x4 2022_ (R$ 420,00), _Speedster Z 2024_ (R$ 630,00), _Expedition Glam 2012_ (R$ 350,00), _Heritage Pink Sweet 57 1957_ (R$ 2.300,00), _Bel-Star Cruiser 1959_ (R$ 1.500,00), _DreamMotors Baby Beetle 2008_ (R$ 180,00), _DreamMotors Grand Vista 2025_ (R$ 1.200,00), _Malibu Auto Ranch Pickup 2020_ (R$ 320,00), _DreamMotors Aurora Roadster 2025_ (R$ 1.800,00), _Heritage Pink Bloom Mini 2023_ (R$ 190,00) e _Malibu Auto Petal Sport 2023_ (R$ 230,00).
  - 56 automóveis: cada modelo em 2 lojas, com 2 carros em cada.
  - A lista do `DataLoader` é a fonte do catálogo: a cada subida, os modelos existentes recebem os dados e as fotos de lá (pelo nome) e os novos entram com os seus carros.
  - 3 bancos: Aurora (1,49% a.m., até 18x, entrada 10%), Celeste (1,59%, até 12x, entrada 20%) e Brilho (1,79%, até 18x, entrada 10%).
- **Logins de teste**, se ainda não existirem:
  - Cliente `cliente@pinkgo.dev` / `pinkgo123`, com 2 rendimentos e um pedido com crédito.
  - Agente da PinkGo `agente@pinkgo.com` / `agente123`. Os bancos não têm login: respondem sozinhos às propostas.

---

## 5. Especificação dos Casos de Uso Implementados

### 5.1 CRUD de Clientes e Sessão (Sprint 02)

- **US01 - Cadastrar Cliente**:
  - Fluxo em **3 passos** (Acesso, Dados, Renda) com stepper no topo.
  - Cada passo valida na tela e confere no servidor antes de avançar (`POST /api/clientes/verificacao`): o passo 1 recusa e-mail já usado; o passo 2, CPF ou RG já cadastrados. O cadastro final confere tudo de novo.
  - CPF validado pelos dígitos verificadores; endereço com sugestões do OpenStreetMap.
  - De 1 a 3 rendimentos, com botão "Adicionar rendimento" e total da renda mensal.
  - Ao concluir, tela de sucesso com o botão para entrar.
- **US02 - Autenticar**:
  - Login único para clientes e agentes, com JWT. O cliente vai para "Meus aluguéis" (ou volta para onde estava) e o agente, para o painel dele.
  - Rotas de cliente e de agente são separadas por papel; quem não está logado vai para o login. Um token de conta que não existe mais encerra a sessão.
  - **Esqueci a senha**: o cliente informa o e-mail e recebe um link (válido por 30 minutos, de uso único). A resposta é a mesma exista ou não a conta. O e-mail sai por SMTP configurado no `.env` (`MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD`); sem ele, o link só aparece no log do back-end.
- **US07 - Manter Perfil**:
  - Acesso pelo menu "Meu perfil" > "Editar dados cadastrais".
  - Tela com três blocos: Acesso (e-mail e alterar senha), Dados pessoais e Profissão e rendimentos.
  - Regra de integridade: proibida exclusão de conta caso o cliente possua pedido em `CONTRATO_EM_EXECUCAO`. Ao excluir, os pedidos ainda modificáveis são cancelados.

### 5.2 Catálogo, Criação e Reserva de Pedidos (Sprint 03)

- **US16 - Catálogo Público**:
  - Página inicial aberta sem autenticação. A busca pede loja de retirada, loja de devolução e datas; erros aparecem embaixo de cada campo e num aviso.
  - A vitrine mostra só os modelos com pelo menos um carro livre na loja de retirada durante todo o período (seção 5.4).
  - "Ver detalhes" vira o cartão e mostra as características, nunca a placa.
- **US03 - Introduzir Pedido de Aluguel**:
  - "Alugar" abre o modal de novo pedido mesmo sem login. Para enviar, quem não entrou é levado ao login ou ao cadastro; as escolhas ficam guardadas e o modal reabre na Início depois do login.
  - Loja de retirada: só as que têm um carro do modelo livre nas datas. Loja de devolução: qualquer loja.
  - Retirada a partir de amanhã e devolução pelo menos 1 dia depois.
  - Forma de liquidação: à vista ou crédito bancário em um ou mais bancos, com o parcelamento de cada um e a simulação pela Tabela Price.
  - Cálculo: $\text{Total Estimado} = \text{Diária} \times (\text{dataEntrega} - \text{dataRetirada})$, sempre feito no servidor.
  - Reserva automática: o servidor escolhe um automóvel do modelo livre no período e cria o pedido em `EM_ANALISE_FINANCEIRA`.
- **US04 - Consultar Pedidos**:
  - O cliente vê apenas os seus pedidos, em lista paginada (5 por página) com cartões-resumo por situação.
  - O modal **Detalhes do pedido** exibe o selo, o stepper de andamento e o resumo completo (lojas, período, placa, total e liquidação).
- **US05 - Modificar Pedido**:
  - "Editar" disponível só em `EM_ANALISE_FINANCEIRA` ou `APROVADO`.
  - Permite trocar lojas, datas e forma de liquidação. O carro atual continua se seguir livre nas novas datas; senão, o servidor troca por outro do mesmo modelo na loja.
  - Recalcula o total; propostas cujo valor ou parcelamento mudou voltam para análise.
  - Pedido aprovado que é modificado volta para `EM_ANALISE_FINANCEIRA`.
- **US06 - Cancelar Pedido**:
  - "Cancelar" em vermelho (`Status/Danger/Text`), disponível em `EM_ANALISE_FINANCEIRA` e `APROVADO`.
  - Modal de confirmação com aviso de irrevogabilidade.
  - O pedido vira `CANCELADO` e deixa de ocupar o carro: os dias voltam a ficar livres para outras reservas.

### 5.3 Crédito Bancário e Parecer do Agente

- **Bancos sem agente**: cada proposta é respondida sozinha uns 30 segundos depois de enviada, pela política do banco (`PoliticaCredito`): renda mínima, quanto da renda a parcela pode ocupar e o maior valor financiado. O Celeste só conta renda com vínculo formal. A resposta traz o motivo (ex.: "A parcela ocuparia 42% da renda; o banco aceita até 30%").
- **Escolha do cliente**: com as respostas, "Meus aluguéis" mostra "Escolher financiamento". O cliente escolhe um banco que aprovou ou segue sem financiamento (o pedido vira sem crédito). Se nenhum aprovou, só resta seguir sem financiamento ou cancelar.
- **Parecer do agente da PinkGo**: o modal **Análise financeira** mostra o cliente (CPF parcial, profissão, rendimentos e renda total), o carro, o período, o contrato e quanto o aluguel (ou a parcela escolhida) pesa na renda, com a sugestão pela regra interna de até 50%. O agente aprova ou nega com justificativa opcional; aprovar só é possível depois dos bancos e da escolha do cliente.
- Fluxo: `EM_ANALISE_FINANCEIRA` → `APROVADO` (depois `CONTRATO_EM_EXECUCAO` → `CONTRATO_ENCERRADO`) ou `NEGADO` (histórico).

### 5.4 Regra de Disponibilidade e Reserva

O cliente reserva um **modelo**, não um carro específico. A reserva é possível se pelo menos um automóvel do modelo, na loja de retirada, atende o período inteiro. A regra fica em `entity/Disponibilidade.java` e vale para a vitrine, para as lojas de retirada e para criar e editar pedidos.

- **Preparação**: cada locação bloqueia o carro por 2 dias antes da retirada e 2 dias depois da devolução prevista, para limpeza e vistoria. Esse intervalo é compartilhado entre locações vizinhas (não soma 4 dias). Exemplo: locação de 03/11 a 10/11 bloqueia de 01/11 a 12/11; a próxima retirada pode ser a partir de 13/11.
- **Status que bloqueiam**:

  | Status do pedido                       | Bloqueia o carro?                                  |
  | :------------------------------------- | :------------------------------------------------- |
  | Em análise, aprovado, em execução      | Sim, com a preparação antes e depois               |
  | Contrato encerrado                     | Só os 2 dias de preparação depois da devolução     |
  | Cancelado, negado                      | Não                                                |

- **Concorrência**: ao reservar, os automóveis do modelo na loja ficam travados até o fim da transação, então dois pedidos simultâneos não ficam com o mesmo carro.
- **A fazer**: prazo de expiração para pedidos em análise (recomendado pela regra, ainda não implementado).

---

## 6. Roteiro de Testes e Validação da Entrega

Os testes automatizados rodam com `./mvnw test` (back-end) e cobrem regras de pedido, de cliente, de disponibilidade, a simulação de crédito, o envio de e-mail e a API passando pela segurança. O roteiro manual:

| Passo  | Ação                                                       | Resultado Esperado                                                                                          |
| :----- | :--------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| **01** | Acessar `/` e pesquisar loja e período                     | Vitrine com os modelos livres naquela loja e período, cartões no padrão PinkGo.                             |
| **02** | Pesquisar sem preencher os campos                          | Mensagem embaixo de cada campo e aviso "Confira a busca".                                                   |
| **03** | Clicar em "Ver detalhes" num cartão                        | O cartão vira e mostra as características, sem a placa; "Esconder detalhes" desvira.                       |
| **04** | Clicar em "Alugar" sem login                               | O modal de pedido abre; "Entrar para enviar o pedido" leva ao login e, depois dele, o modal reabre na Início. |
| **05** | Cadastrar cliente com 3 rendas                             | Cada passo confere os dados; e-mail, CPF ou RG repetidos não deixam avançar; conta criada com sucesso.      |
| **06** | Criar pedido de aluguel                                    | Dias e diária multiplicados corretamente; carro com placa reservado automaticamente; aviso "Pedido enviado". |
| **07** | Buscar o mesmo modelo e loja até acabarem os carros        | Com todos os carros ocupados no período (preparação incluída), o modelo some da vitrine.                    |
| **08** | Visualizar detalhes do pedido                              | Modal com selo, barra de andamento em rosa (`#FF3EB5`) e resumo dos dados do aluguel.                       |
| **09** | Editar pedido em análise (trocar datas)                    | Total recalculado e pedido mantido em `Em análise financeira`.                                              |
| **10** | Cancelar pedido                                            | Pedido em `Cancelado` (selo cinza) e os dias do carro livres para nova reserva.                             |
| **11** | Editar dados cadastrais (adicionar 3º rendimento)          | Renda mensal total atualizada; um 4º rendimento não pode ser adicionado.                                    |
| **12** | "Esqueceu sua senha?" com o e-mail de um cliente           | E-mail com o link chega (com SMTP configurado); o link troca a senha e não funciona uma segunda vez.         |
| **13** | Entrar com um agente (`agente@pinkgo.com`)                 | Vai para o Painel do agente; as telas de cliente redirecionam para lá.                                      |
