# @bernosol/ibepem-estados

União fechada dos estados do aluno (`statusPassoAPasso`). **Fonte única** dos três
repositórios do IBEPEM.

Repositório próprio, e não dentro de um dos três: morando dentro
de qualquer um deles, os outros dois passariam a depender daquele
por razão errada — painel e app não consomem backend, consomem uma lista.

---

## O problema que este pacote fecha

Antes dele, a mesma união existia em três formas incompatíveis:

| Repositório | Como declarava | Consequência |
|---|---|---|
| painel | União fechada de **8** valores (`interfaces/usuario.ts:39`) | Excluía valores que o app já gravava |
| app | `statusPassoAPasso: string` | Sem união nenhuma. É quem grava os dois valores que o painel não conhece |
| backend | Literais soltos no código | Sem tipo e sem lista |

Os dois valores ausentes atravessavam sem erro de compilação dos dois lados: o painel não
acusava porque nenhum código do painel os atribuía.

---

## Uso

### Painel e app — como tipo

```ts
import { EstadoAluno } from '@bernosol/ibepem-estados';

export interface usuario {
  statusPassoAPasso: EstadoAluno;
}
```

Atribuir literal fora da união quebra a build.

### Backend — como valor em runtime

O backend é CommonJS puro e **não tem etapa de compilação**, então a garantia ali não pode
ser de tipo. É o array, somado a um teste próprio do backend:

```js
const { ESTADOS } = require('@bernosol/ibepem-estados');

ESTADOS.includes(valor); // 10 estados, congelados
```

---

## Autenticação

O pacote é público no GitHub Packages; o .npmrc de cada consumidor aponta o escopo:

Para **publicar** é preciso `write:packages`, que é escopo à parte de `read:packages`.

---

## Publicar uma versão nova

Publicação é irreversível: uma versão publicada no GitHub Packages não se apaga. Por isso
o workflow **não** publica em push para `master` — publica em tag:

```sh
npm version patch   # ou minor/major — atualiza package.json e cria a tag
git push --follow-tags
```

O workflow roda os testes, confere que a tag bate com a versão do `package.json`, e só
então publica.

---

## Alterar a lista

Acrescentar ou remover estado aqui **é alterar a máquina de estados**, não editar uma
constante.

Antes de remover, buscar quem ainda lê o valor e anexar a busca ao commit. 
Documentação não é evidência de que ninguém lê.
Antes de acrescentar, o estado precisa ter escritor e leitor declarados
— estado órfão não entra. Um teste compara esta lista com os estados que
as transições conseguem produzir.

A lista está em **dois** arquivos, `index.js` (CommonJS) e `index.mjs` (ESM), porque
CommonJS não consegue `require` de ESM e este pacote não tem etapa de build. `npm test`
compara as duas e reprova se divergirem — é o que impede a fonte única de passar a ter
duas versões em silêncio.
