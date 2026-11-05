/**
 * Nome de cada campo dos formulários de conta, usado como título do aviso de erro daquele campo
 * (`toast.camposInvalidos`). As chaves são as mesmas dos erros que a API devolve por campo.
 */
export const ROTULOS_CAMPOS: Record<string, string> = {
  email: "E-mail",
  senha: "Senha",
  termos: "Termos de uso",
  nome: "Nome completo",
  cpf: "CPF",
  rg: "RG",
  endereco: "Endereço",
  profissao: "Profissão",
  rendimentos: "Rendimentos",
  senhaAtual: "Senha atual",
  novaSenha: "Nova senha",
  nova: "Nova senha",
  confirmacao: "Confirmação da senha",
};
