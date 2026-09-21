// Entrada ESM — mesma lista de index.js, para os bundlers do painel e do app.
//
// Existe para que o Angular não caia no aviso de dependência CommonJS
// ("CommonJS or AMD dependencies can cause optimization bailouts"), que tornaria
// a build ruidosa sem tornar nada errado. O critério da T008 é build limpa.
//
// As duas listas precisam ser idênticas. O teste do pacote compara as duas.

export const ESTADOS = Object.freeze([
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
