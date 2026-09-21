// Fonte única dos estados do aluno — Spec 004, RF-11.
//
// Esta lista é consumida pelos três repositórios:
//   - painel e app, como TIPO (a união fechada, via index.d.ts)
//   - backend, como VALOR em runtime (este arquivo, CommonJS puro, sem etapa de build)
//
// A ordem é a da §4 da SPEC-004, que segue o fluxo do aluno. Não é alfabética por
// escolha: quem lê a lista tem de conseguir enxergar o percurso.
//
// Acrescentar ou remover estado aqui é alterar a máquina de estados. Antes de remover,
// a RF-14 exige a busca de leitores anexada ao commit — documentação não é evidência.

const ESTADOS = Object.freeze([
  'LEAD',
  'Criando senha',
  'Docs a validar',
  'Escolhendo cronograma',
  'Aguardando pagamento da inscrição',
  'Aguardando contrato',
  'Adimplente',
  'Formado',
  'Inadimplente'
]);

module.exports = { ESTADOS };
