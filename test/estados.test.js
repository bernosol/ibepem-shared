const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const { ESTADOS } = require('../index.js');

// A §4 da SPEC-004 fixa nove estados: a tabela de lá tem dez linhas, e a emenda de
// 16/09/2026 logo abaixo dela tira 'Enviando Docs' do pacote. A Spec 007 (Bloco 10, T243) acrescenta
// 'Trancado' e 'Cancelado', fora do fluxo, no fim da tupla: são onze. Este arquivo é a guarda do
// pacote: se alguém acrescentar, remover ou renomear um estado sem passar pela spec,
// aqui reprova.
//
// Os onze estão escritos à mão, um por linha, e NÃO derivados de ESTADOS — um teste
// que comparasse a lista consigo mesma passaria em qualquer alteração.
const NOVE_ESTADOS_DA_SPEC = [
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

// Os dois da Spec 007, escritos à mão: a grafia exata é literal que painel, app e backend copiam.
const DOIS_DA_SPEC_007 = ['Trancado', 'Cancelado'];

const ONZE_ESTADOS = [...NOVE_ESTADOS_DA_SPEC, 'Trancado', 'Cancelado'];

describe('ESTADOS — a união da §4 da SPEC-004', () => {
  test('tem exatamente onze estados', () => {
    assert.equal(ESTADOS.length, 11);
  });

  test('é exatamente a lista da spec, na ordem do fluxo', () => {
    assert.deepEqual([...ESTADOS], ONZE_ESTADOS);
  });

  test('inclui os dois que faltavam na união do painel', () => {
    // 'LEAD' e 'Aguardando pagamento da inscrição' são gravados em produção pelo app
    // e estavam FORA da união de 8 valores do painel (usuario.ts:39) [LEV].
    // É metade do defeito que a RF-11 existe para fechar.
    assert.ok(ESTADOS.includes('LEAD'));
    assert.ok(ESTADOS.includes('Aguardando pagamento da inscrição'));
  });

  test('os nove antigos seguem nas mesmas posições, e os dois novos vêm no fim', () => {
    // Um teste do painel usa o índice de 'Aguardando contrato': deslocar os antigos o quebraria.
    NOVE_ESTADOS_DA_SPEC.forEach((estado, i) => assert.equal(ESTADOS[i], estado));
    assert.equal(ESTADOS[9], DOIS_DA_SPEC_007[0]);
    assert.equal(ESTADOS[10], DOIS_DA_SPEC_007[1]);
  });

  test('não tem valor repetido', () => {
    assert.equal(new Set(ESTADOS).size, ESTADOS.length);
  });

  test('é imutável — consumidor não altera a fonte única', () => {
    assert.ok(Object.isFrozen(ESTADOS));
    assert.throws(() => { ESTADOS.push('Inventado'); }, TypeError);
    assert.equal(ESTADOS.length, 11);
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

// A comparação acima tira o valor esperado de index.js, que também está sob teste.
// Cada entrada é conferida também contra a lista escrita à mão, para que o estado
// de volta em um arquivo só reprove por asserção contra a spec — e não apenas pela
// diferença entre dois arquivos.
describe('index.mjs — contra a lista da spec', () => {
  test('tem exatamente onze estados', async () => {
    const esm = await import('../index.mjs');

    assert.equal(esm.ESTADOS.length, 11);
  });

  test('é exatamente a lista da spec, na ordem do fluxo', async () => {
    const esm = await import('../index.mjs');

    assert.deepEqual([...esm.ESTADOS], ONZE_ESTADOS);
  });
});

// index.d.ts não é executável, e é o que painel e app consomem como tipo: um estado
// esquecido ali passaria por todos os testes acima. A tupla é lida do texto.
//
// A extração é estrita de propósito: sem a declaração, ou com qualquer linha da
// tupla que não seja um literal entre aspas simples, ela lança em vez de devolver
// uma lista parcial — uma lista parcial poderia coincidir com a da spec e aprovar.
const ABERTURA_DA_TUPLA = 'export declare const ESTADOS: readonly [';

function extrairTuplaDoDts(texto) {
  if (typeof texto !== 'string') {
    throw new TypeError('o conteúdo de index.d.ts tem de ser string');
  }
  const inicio = texto.indexOf(ABERTURA_DA_TUPLA);
  if (inicio === -1) {
    throw new Error('declaração de ESTADOS não encontrada em index.d.ts');
  }
  const corpo = texto.slice(inicio + ABERTURA_DA_TUPLA.length);
  const fim = corpo.indexOf('];');
  if (fim === -1) {
    throw new Error('a tupla de ESTADOS não fecha em index.d.ts');
  }
  return corpo
    .slice(0, fim)
    .split('\n')
    .map((linha) => linha.trim())
    .filter((linha) => linha !== '')
    .map((linha) => {
      const literal = /^'([^']+)',?$/.exec(linha);
      if (!literal) {
        throw new Error(`linha da tupla que não é literal entre aspas simples: ${linha}`);
      }
      return literal[1];
    });
}

describe('index.d.ts — contra a lista da spec', () => {
  const dts = extrairTuplaDoDts(
    require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'index.d.ts'), 'utf8')
  );

  test('tem exatamente onze estados', () => {
    assert.equal(dts.length, 11);
  });

  test('é exatamente a lista da spec, na ordem do fluxo', () => {
    assert.deepEqual(dts, ONZE_ESTADOS);
  });
});

describe('a extração do index.d.ts recusa o que não sabe ler', () => {
  test('recusa conteúdo que não é string', () => {
    assert.throws(() => extrairTuplaDoDts(undefined), TypeError);
    assert.throws(() => extrairTuplaDoDts(null), TypeError);
    assert.throws(() => extrairTuplaDoDts(Buffer.from('')), TypeError);
  });

  test('recusa texto vazio ou sem a declaração', () => {
    assert.throws(() => extrairTuplaDoDts(''), /não encontrada/);
    assert.throws(() => extrairTuplaDoDts("export declare const OUTRA: readonly ['LEAD'];"), /não encontrada/);
  });

  test('recusa tupla que não fecha', () => {
    assert.throws(() => extrairTuplaDoDts(`${ABERTURA_DA_TUPLA}\n  'LEAD',\n`), /não fecha/);
  });

  test('recusa linha que não é literal entre aspas simples', () => {
    assert.throws(() => extrairTuplaDoDts(`${ABERTURA_DA_TUPLA}\n  'LEAD',\n  "Formado",\n];`), /não é literal/);
    assert.throws(() => extrairTuplaDoDts(`${ABERTURA_DA_TUPLA}\n  'LEAD', 'Formado',\n];`), /não é literal/);
    assert.throws(() => extrairTuplaDoDts(`${ABERTURA_DA_TUPLA}\n  // 'Enviando Docs',\n];`), /não é literal/);
  });

  test('tupla vazia devolve lista vazia, que a comparação com a spec reprova', () => {
    assert.deepEqual(extrairTuplaDoDts(`${ABERTURA_DA_TUPLA}\n];`), []);
  });
});
