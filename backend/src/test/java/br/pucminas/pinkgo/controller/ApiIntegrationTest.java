package br.pucminas.pinkgo.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.jayway.jsonpath.JsonPath;

import br.pucminas.pinkgo.config.DataLoader;
import br.pucminas.pinkgo.service.AnaliseCreditoService;

/**
 * Sobe a aplicação no banco de verdade (Supabase, pelo backend/.env) e passa pela segurança de verdade. Cada teste roda
 * numa transação desfeita no fim: pedidos, contas e edições feitos aqui não ficam no banco.
 */
@SpringBootTest(properties = "pinkgo.bancos.analise-automatica=false")
@Transactional
class ApiIntegrationTest {

	@Autowired
	WebApplicationContext context;

	@Autowired
	AnaliseCreditoService analiseCredito;

	MockMvc mvc;

	@BeforeEach
	void setUp() {
		mvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
	}

	@Test
	void catalogoEPublico() throws Exception {
		mvc.perform(get("/api/modelos")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(14));
	}

	@Test
	void lojasDoModeloSaoPublicasESoAsComAutomovelLivre() throws Exception {
		mvc.perform(get("/api/modelos/1/locais")).andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(greaterThan(0)))
				.andExpect(jsonPath("$[0].descricao").exists());
		mvc.perform(get("/api/modelos/9999/locais")).andExpect(status().isNotFound());
	}

	@Test
	void pedidosExigemLogin() throws Exception {
		mvc.perform(get("/api/pedidos")).andExpect(status().isUnauthorized());
	}

	@Test
	void senhaErradaRetorna401() throws Exception {
		mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"" + DataLoader.EMAIL_TESTE + "\",\"senha\":\"errada\"}"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void loginDevolveTokenQueAbreOsPedidosDoCliente() throws Exception {
		String resposta = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"" + DataLoader.EMAIL_TESTE + "\",\"senha\":\"" + DataLoader.SENHA_TESTE + "\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.cliente.email").value(DataLoader.EMAIL_TESTE))
				.andReturn().getResponse().getContentAsString();
		String token = JsonPath.read(resposta, "$.token");

		mvc.perform(get("/api/pedidos").header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pagina").value(1))
				.andExpect(jsonPath("$.itens[0].automovel.placa").exists());
	}

	@Test
	void atualizarPerfilDevolveRendimentosComId() throws Exception {
		String token = JsonPath.read(mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"" + DataLoader.EMAIL_TESTE + "\",\"senha\":\"" + DataLoader.SENHA_TESTE + "\"}"))
				.andReturn().getResponse().getContentAsString(), "$.token");

		mvc.perform(put("/api/clientes/me").header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"nome":"Cliente de Teste","cpf":"529.982.247-25","rg":"MG-12.345.678","endereco":"Rua A",
						 "profissao":"Designer","email":"%s",
						 "rendimentos":[{"tipo":"OUTRO","entidadeEmpregadora":"Freela","valorMensal":500}]}
						""".formatted(DataLoader.EMAIL_TESTE)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.rendimentos[0].id").isNumber());
	}

	private String login(String email, String senha) throws Exception {
		return JsonPath.read(mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"" + email + "\",\"senha\":\"" + senha + "\"}"))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString(), "$.token");
	}

	@Test
	void agenteEntraPeloMesmoLoginMasNaoVePedidosDeCliente() throws Exception {
		mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"" + DataLoader.EMAIL_AGENTE_EMPRESA + "\",\"senha\":\"" + DataLoader.SENHA_AGENTES + "\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.papel").value("AGENTE_EMPRESA"))
				.andExpect(jsonPath("$.cliente").doesNotExist());
		// Os bancos respondem sozinhos: não há mais login de banco.
		mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"aurora@bancos.dev\",\"senha\":\"" + DataLoader.SENHA_AGENTES + "\"}"))
				.andExpect(status().isUnauthorized());

		String token = login(DataLoader.EMAIL_AGENTE_EMPRESA, DataLoader.SENHA_AGENTES);
		mvc.perform(get("/api/agentes/me").header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value(DataLoader.EMAIL_AGENTE_EMPRESA));
		mvc.perform(get("/api/pedidos").header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
	}

	@Test
	void clienteNaoEntraNaAreaDosAgentes() throws Exception {
		String token = login(DataLoader.EMAIL_TESTE, DataLoader.SENHA_TESTE);
		mvc.perform(get("/api/agentes/me").header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
	}

	/** O erro "Cliente não encontrado": um token de conta que não existe mais agora responde 401. */
	@Test
	void tokenDeContaExcluidaResponde401() throws Exception {
		mvc.perform(post("/api/clientes").contentType(MediaType.APPLICATION_JSON).content("""
				{"nome":"Bia","cpf":"111.444.777-35","rg":"98.765.432-1","endereco":"Rua B","profissao":"Arquiteta",
				 "email":"bia@x.com","senha":"senhaforte1",
				 "rendimentos":[{"tipo":"OUTRO","entidadeEmpregadora":"Freela","valorMensal":500}]}
				""")).andExpect(status().isCreated());
		String token = login("bia@x.com", "senhaforte1");

		mvc.perform(delete("/api/clientes/me").header("Authorization", "Bearer " + token))
				.andExpect(status().isNoContent());
		mvc.perform(get("/api/pedidos").header("Authorization", "Bearer " + token))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void esqueciSenhaRespondeIgualParaQualquerEmail() throws Exception {
		for (String email : new String[] { DataLoader.EMAIL_TESTE, "ninguem@x.com" })
			mvc.perform(post("/api/auth/esqueci-senha").contentType(MediaType.APPLICATION_JSON)
					.content("{\"email\":\"" + email + "\"}"))
					.andExpect(status().isAccepted());
	}

	@Test
	void cadastroInvalidoDevolveErrosPorCampo() throws Exception {
		mvc.perform(post("/api/clientes").contentType(MediaType.APPLICATION_JSON)
				.content("{\"nome\":\"\",\"cpf\":\"123\",\"rendimentos\":[]}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.erros.cpf").value("CPF inválido."))
				.andExpect(jsonPath("$.erros.nome").exists());
	}

	/**
	 * O Pegasus Cabrio (modelo 1) tem dois automóveis em Belo Horizonte (loja 1). Dois aluguéis nos mesmos dias usam
	 * os dois; o terceiro é recusado e o modelo some da vitrine e das lojas de retirada daquele período, mas continua
	 * em outras datas. Cancelar um dos pedidos devolve o modelo.
	 */
	@Test
	void disponibilidadeDependeDosCarrosLivresNoPeriodo() throws Exception {
		String token = "Bearer " + login(DataLoader.EMAIL_TESTE, DataLoader.SENHA_TESTE);
		LocalDate retirada = LocalDate.now().plusDays(60);
		LocalDate entrega = retirada.plusDays(3);
		String periodo = "retirada=" + retirada + "&entrega=" + entrega;
		// Devolução em Fortaleza (loja 4): qualquer loja serve.
		String pedido = """
				{"modeloId":1,"localRetiradaId":1,"localDevolucaoId":4,"dataRetirada":"%s","dataEntrega":"%s","comCredito":false}
				""".formatted(retirada, entrega);

		mvc.perform(get("/api/modelos?localId=1&" + periodo)).andExpect(jsonPath("$[*].id", hasItem(1)));
		String primeiro = mvc.perform(post("/api/pedidos").header("Authorization", token)
				.contentType(MediaType.APPLICATION_JSON).content(pedido))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.localDevolucao.cidade").value("Fortaleza"))
				.andReturn().getResponse().getContentAsString();
		// Um alugado não esgota o modelo: ainda há o segundo carro da loja.
		mvc.perform(get("/api/modelos?localId=1&" + periodo)).andExpect(jsonPath("$[*].id", hasItem(1)));
		mvc.perform(post("/api/pedidos").header("Authorization", token)
				.contentType(MediaType.APPLICATION_JSON).content(pedido))
				.andExpect(status().isCreated());

		mvc.perform(post("/api/pedidos").header("Authorization", token)
				.contentType(MediaType.APPLICATION_JSON).content(pedido))
				.andExpect(status().is(422));
		mvc.perform(get("/api/modelos?localId=1&" + periodo)).andExpect(jsonPath("$[*].id", not(hasItem(1))));
		mvc.perform(get("/api/modelos/1/locais?" + periodo)).andExpect(jsonPath("$[*].id", not(hasItem(1))));
		// Passados os 2 dias de preparação depois da entrega, os carros estão livres de novo.
		mvc.perform(get("/api/modelos?localId=1&retirada=" + entrega.plusDays(3) + "&entrega=" + entrega.plusDays(5)))
				.andExpect(jsonPath("$[*].id", hasItem(1)));

		Integer id = JsonPath.read(primeiro, "$.id");
		mvc.perform(post("/api/pedidos/" + id + "/cancelamento").header("Authorization", token))
				.andExpect(status().isOk());
		mvc.perform(get("/api/modelos?localId=1&" + periodo)).andExpect(jsonPath("$[*].id", hasItem(1)));
	}

	/**
	 * Exemplo do documento da regra: com os dois Baby Beetle (modelo 9) de Goiânia (loja 3) locados de 03 a 10, os
	 * dias 01–02 e 11–12 ficam bloqueados para preparação. Uma nova retirada só cabe a partir do dia 13, e uma locação
	 * anterior precisa terminar até o dia 30 do mês de antes (3 dias antes da retirada).
	 */
	@Test
	void preparacaoDeDoisDiasAntesEDepoisDeCadaLocacao() throws Exception {
		String token = "Bearer " + login(DataLoader.EMAIL_TESTE, DataLoader.SENHA_TESTE);
		LocalDate dia3 = LocalDate.now().plusDays(120);
		LocalDate dia10 = dia3.plusDays(7);
		for (int i = 0; i < 2; i++)
			mvc.perform(post("/api/pedidos").header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
					.content("""
							{"modeloId":9,"localRetiradaId":3,"dataRetirada":"%s","dataEntrega":"%s","comCredito":false}
							""".formatted(dia3, dia10)))
					.andExpect(status().isCreated())
					.andExpect(jsonPath("$.localDevolucao.cidade").value("Goiânia"));

		// Depois: dia 12 ainda é preparação; dia 13 já pode.
		mvc.perform(get("/api/modelos?localId=3&retirada=" + dia10.plusDays(2) + "&entrega=" + dia10.plusDays(4)))
				.andExpect(jsonPath("$[*].id", not(hasItem(9))));
		mvc.perform(get("/api/modelos?localId=3&retirada=" + dia10.plusDays(3) + "&entrega=" + dia10.plusDays(5)))
				.andExpect(jsonPath("$[?(@.id == 9)].disponiveis", hasItem(2)));
		// Antes: devolver no dia 01 cai na preparação; no dia 31 (3 dias antes) cabe.
		mvc.perform(get("/api/modelos?localId=3&retirada=" + dia3.minusDays(6) + "&entrega=" + dia3.minusDays(2)))
				.andExpect(jsonPath("$[*].id", not(hasItem(9))));
		mvc.perform(get("/api/modelos?localId=3&retirada=" + dia3.minusDays(7) + "&entrega=" + dia3.minusDays(3)))
				.andExpect(jsonPath("$[*].id", hasItem(9)));
	}

	@Test
	void cadastroConfereEmailCpfERgAntesDeAvancar() throws Exception {
		mvc.perform(post("/api/clientes/verificacao").contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"" + DataLoader.EMAIL_TESTE.toUpperCase() + "\"}"))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.erros.email").exists());
		// E-mail de agente também conta: o login é um só.
		mvc.perform(post("/api/clientes/verificacao").contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"" + DataLoader.EMAIL_AGENTE_EMPRESA + "\"}"))
				.andExpect(status().isConflict());
		mvc.perform(post("/api/clientes/verificacao").contentType(MediaType.APPLICATION_JSON)
				.content("{\"cpf\":\"529.982.247-25\",\"rg\":\"99.999.999\"}"))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.erros.cpf").exists());
		mvc.perform(post("/api/clientes/verificacao").contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"nova@pinkgo.dev\",\"cpf\":\"111.444.777-35\",\"rg\":\"99.999.999\"}"))
				.andExpect(status().isNoContent());
	}

	@Test
	void fotosDosCarrosVemDaApi() throws Exception {
		mvc.perform(get("/api/modelos/2"))
				.andExpect(jsonPath("$.imagemUrl").value(matchesPattern(
						"http://localhost/api/imagens/carros/sunset-gt-pink-[0-9a-f]{32}\\.png")));
		String url = JsonPath.read(mvc.perform(get("/api/modelos/2")).andReturn().getResponse().getContentAsString(),
				"$.imagemUrl");
		mvc.perform(get(url.replace("http://localhost", ""))).andExpect(status().isOk());
		mvc.perform(get("/api/imagens/carros/sunset-gt-pink.png")).andExpect(status().isOk());
	}

	private String criarPedido(String cliente, String corpo) throws Exception {
		return mvc.perform(post("/api/pedidos").header("Authorization", cliente)
				.contentType(MediaType.APPLICATION_JSON).content(corpo))
				.andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString();
	}

	/**
	 * Fluxo com crédito, sem agente de banco: o cliente (renda de R$ 9.700) pede o Sweet 57 por 20 dias (R$ 46.000) nos
	 * três bancos. Depois do tempo de resposta, o Aurora e o Celeste negam (valor acima do limite deles) e o Brilho
	 * aprova. A PinkGo só pode dar o parecer depois que o cliente escolhe o Brilho; aí aprova, com justificativa, e
	 * inicia e encerra o contrato.
	 */
	@Test
	void bancosRespondemSozinhosEOClienteEscolheOFinanciamento() throws Exception {
		String cliente = "Bearer " + login(DataLoader.EMAIL_TESTE, DataLoader.SENHA_TESTE);
		String empresa = "Bearer " + login(DataLoader.EMAIL_AGENTE_EMPRESA, DataLoader.SENHA_AGENTES);
		LocalDate retirada = LocalDate.now().plusDays(250);
		String criado = criarPedido(cliente, """
				{"modeloId":6,"localRetiradaId":2,"dataRetirada":"%s","dataEntrega":"%s","comCredito":true,
				 "propostas":[{"bancoId":1,"parcelas":18},{"bancoId":2,"parcelas":12},{"bancoId":3,"parcelas":18}]}
				""".formatted(retirada, retirada.plusDays(20)));
		Integer id = JsonPath.read(criado, "$.id");
		String doCliente = "/api/pedidos/" + id;
		String doAgente = "/api/agentes/pedidos/" + id;

		mvc.perform(post(doAgente + "/aprovacao").header("Authorization", empresa)).andExpect(status().is(422));
		assertThat(analiseCredito.responderPendentes(Instant.now().plusSeconds(60))).isGreaterThanOrEqualTo(3);

		mvc.perform(get(doCliente).header("Authorization", cliente))
				.andExpect(jsonPath("$.propostas[?(@.banco.nome == 'Banco Aurora')].status", hasItem("NEGADA")))
				.andExpect(jsonPath("$.propostas[?(@.banco.nome == 'Banco Celeste')].status", hasItem("NEGADA")))
				.andExpect(jsonPath("$.propostas[?(@.banco.nome == 'Banco Brilho')].status", hasItem("APROVADA")))
				.andExpect(jsonPath("$.pendenciaParaAprovar").value("O cliente ainda não escolheu o banco do financiamento."));
		// Só dá para escolher um banco que aprovou; e a PinkGo espera a escolha.
		mvc.perform(post(doCliente + "/financiamento").header("Authorization", cliente)
				.contentType(MediaType.APPLICATION_JSON).content("{\"bancoId\":1}"))
				.andExpect(status().is(422));
		mvc.perform(post(doAgente + "/aprovacao").header("Authorization", empresa)).andExpect(status().is(422));

		mvc.perform(post(doCliente + "/financiamento").header("Authorization", cliente)
				.contentType(MediaType.APPLICATION_JSON).content("{\"bancoId\":3}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.bancoAssociado").value("Banco Brilho"))
				.andExpect(jsonPath("$.propostas[?(@.banco.nome == 'Banco Brilho')].escolhida", hasItem(true)));
		mvc.perform(post(doAgente + "/aprovacao").header("Authorization", empresa)
				.contentType(MediaType.APPLICATION_JSON).content("{\"justificativa\":\"Parcela de 28% da renda.\",\"tipoContrato\":\"PROPRIEDADE_CLIENTE\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pedido.status").value("APROVADO"))
				.andExpect(jsonPath("$.pedido.tipoContrato").value("PROPRIEDADE_CLIENTE"))
				.andExpect(jsonPath("$.pedido.justificativaParecer").value("Parcela de 28% da renda."));
		mvc.perform(post(doAgente + "/inicio-contrato").header("Authorization", empresa))
				.andExpect(jsonPath("$.pedido.status").value("CONTRATO_EM_EXECUCAO"));
		mvc.perform(post(doAgente + "/encerramento").header("Authorization", empresa))
				.andExpect(jsonPath("$.pedido.status").value("CONTRATO_ENCERRADO"));
	}

	/** O cliente pode desistir do crédito: o pedido fica sem financiamento e a PinkGo dá o parecer (aqui, negando). */
	@Test
	void clienteDesisteDoFinanciamentoEAgenteNega() throws Exception {
		String cliente = "Bearer " + login(DataLoader.EMAIL_TESTE, DataLoader.SENHA_TESTE);
		String empresa = "Bearer " + login(DataLoader.EMAIL_AGENTE_EMPRESA, DataLoader.SENHA_AGENTES);
		LocalDate retirada = LocalDate.now().plusDays(280);
		Integer id = JsonPath.read(criarPedido(cliente, """
				{"modeloId":5,"localRetiradaId":1,"dataRetirada":"%s","dataEntrega":"%s","comCredito":true,
				 "propostas":[{"bancoId":2,"parcelas":12}]}
				""".formatted(retirada, retirada.plusDays(4))), "$.id");

		mvc.perform(post("/api/pedidos/" + id + "/financiamento/desistencia").header("Authorization", cliente))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.comCredito").value(false))
				.andExpect(jsonPath("$.propostas.length()").value(0))
				.andExpect(jsonPath("$.pendenciaParaAprovar").doesNotExist());
		mvc.perform(post("/api/agentes/pedidos/" + id + "/aprovacao").header("Authorization", empresa)
				.contentType(MediaType.APPLICATION_JSON).content("{\"tipoContrato\":\"PROPRIEDADE_BANCO\"}"))
				.andExpect(status().is(422))
				.andExpect(jsonPath("$.erros.tipoContrato").exists());
		mvc.perform(post("/api/agentes/pedidos/" + id + "/negacao").header("Authorization", empresa)
				.contentType(MediaType.APPLICATION_JSON).content("{\"justificativa\":\"Documentos incompletos.\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pedido.status").value("NEGADO"));
	}

	@Test
	void clienteNaoUsaOPainelDoAgente() throws Exception {
		String cliente = "Bearer " + login(DataLoader.EMAIL_TESTE, DataLoader.SENHA_TESTE);
		mvc.perform(get("/api/agentes/pedidos").header("Authorization", cliente)).andExpect(status().isForbidden());
		mvc.perform(get("/api/agentes/pedidos/resumo").header("Authorization", "Bearer "
				+ login(DataLoader.EMAIL_AGENTE_EMPRESA, DataLoader.SENHA_AGENTES))).andExpect(status().isOk());
	}
}
