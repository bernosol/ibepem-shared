const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const { ESTADOS } = require('../index.js');

// A §4 da SPEC-004 fixa dez estados. Este arquivo é a guarda do pacote: se alguém
// acrescentar, remover ou renomear um estado sem passar pela spec, aqui reprova.
//
// Os dez estão escritos à mão, um por linha, e NÃO derivados de ESTADOS — um teste
// que comparasse a lista consigo mesma passaria em qualquer alteração.
const DEZ_ESTADOS_DA_SPEC = [
  'LEAD',
  'Criando senha',
  'Enviando Docs',
  'Docs a validar',
  'Escolhendo cronograma',
  'Aguardando pagamento da inscrição',
  'Aguardando contrato',
  'Adimplente',
  'Formado',
  'Inadimplente'
];

describe('ESTADOS — a união da §4 da SPEC-004', () => {
  test('tem exatamente dez estados', () => {
    assert.equal(ESTADOS.length, 10);
  });

  test('é exatamente a lista da spec, na ordem do fluxo', () => {
    assert.deepEqual([...ESTADOS], DEZ_ESTADOS_DA_SPEC);
  });

  test('inclui os dois que faltavam na união do painel', () => {
    // 'LEAD' e 'Aguardando pagamento da inscrição' são gravados em produção pelo app
    // e estavam FORA da união de 8 valores do painel (usuario.ts:39) [LEV].
    // É metade do defeito que a RF-11 existe para fechar.
    assert.ok(ESTADOS.includes('LEAD'));
    assert.ok(ESTADOS.includes('Aguardando pagamento da inscrição'));
  });

  test('não tem valor repetido', () => {
    assert.equal(new Set(ESTADOS).size, ESTADOS.length);
  });

  test('é imutável — consumidor não altera a fonte única', () => {
    assert.ok(Object.isFrozen(ESTADOS));
    assert.throws(() => { ESTADOS.push('Inventado'); }, TypeError);
    assert.equal(ESTADOS.length, 10);
  });
});

describe('as duas entradas do pacote não podem divergir', () => {
  // O pacote publica duas listas: index.js (CommonJS, para o backend, que não tem
  // etapa de build) e index.mjs (ESM, para os bundlers do painel e do app, que sem
  // ela emitem aviso de dependência CommonJS).
  //
  // CommonJS não consegue `require` de ESM de forma síncrona, e não há etapa de
  // build neste pacote — então as duas listas são escritas separadamente. Este teste
  // é o que impede que a duplicação vire divergência: sem ele, a fonte "única" teria
  // duas versões e nada acusaria.
  test('index.mjs declara exatamente a mesma lista que index.js', async () => {
    const esm = await import('../index.mjs');

    assert.deepEqual([...esm.ESTADOS], [...ESTADOS]);
  });
});
