/**
 * União fechada dos estados do aluno — Spec 004, RF-11.
 *
 * A tupla é `readonly` e literal de propósito: é dela que `EstadoAluno` deriva.
 * Trocá-la por `string[]` faria o tipo virar `string` e a garantia desaparecer sem
 * que nada quebrasse — que é exatamente o defeito de hoje no app
 * (`interfaces/usuario.ts:39` declara `statusPassoAPasso: string`).
 */
export declare const ESTADOS: readonly [
  'LEAD',
  'Criando senha',
  'Docs a validar',
  'Escolhendo cronograma',
  'Aguardando pagamento da inscrição',
  'Aguardando contrato',
  'Adimplente',
  'Formado',
  'Inadimplente'
];

/**
 * O tipo de `statusPassoAPasso`. Atribuir qualquer literal fora desta união
 * quebra a compilação no painel e no app — é o critério de aceite da RF-11.
 */
export type EstadoAluno = (typeof ESTADOS)[number];
