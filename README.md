# @bernosol/ibepem-estados

União fechada dos estados do aluno (`statusPassoAPasso`). **Fonte única** dos três
repositórios do IBEPEM.

Criado pela **Spec 004, RF-11**. Decisão D-2, de 10/08/2026: repositório próprio, e não
dentro de um dos três. Morando dentro de qualquer um deles, os outros dois passariam a
depender daquele por razão errada — painel e app não consomem backend, consomem uma lista.

---

## O problema que este pacote fecha

Antes dele, a mesma união existia em três formas incompatíveis:

| Repositório | Como declarava | Consequência |
|---|---|---|
| painel | União fechada de **8** valores (`interfaces/usuario.ts:39`) | Excluía `'LEAD'` e `'Aguardando pagamento da inscrição'`, **ambos gravados em produção** pelo app |
| app | `statusPassoAPasso: string` | Sem união nenhuma. É quem grava os dois valores que o painel não conhece |
| backend | Literais soltos no código | Sem tipo e sem lista |

Os dois valores ausentes atravessavam sem erro de compilação dos dois lados: o painel não
acusava porque nenhum código do painel os atribuía. `[LEV]`

---

## Uso

### Painel e app — como tipo

```ts
import { EstadoAluno } from '@bernosol/ibepem-estados';

export interface usuario {
  statusPassoAPasso: EstadoAluno;
}
```

Atribuir literal fora da união quebra a build. É o critério de aceite da RF-11.

### Backend — como valor em runtime

O backend é CommonJS puro e **não tem etapa de compilação**, então a garantia ali não pode
ser de tipo. É o array, somado ao teste declarativo do P-07:

```js
const { ESTADOS } = require('@bernosol/ibepem-estados');

ESTADOS.includes(valor); // 10 estados, congelados
```

---

## Autenticação

O pacote é privado, no GitHub Packages. Para instalá-lo, cada repositório consumidor tem
um `.npmrc` apontando o escopo, e o token vem do ambiente — **nunca** do arquivo:

```
@bernosol:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Localmente, exportar um Personal Access Token com escopo **`read:packages`**:

```sh
export NODE_AUTH_TOKEN=ghp_...
npm install
```

No CI, `secrets.GITHUB_TOKEN` já basta — é o mesmo mecanismo que publica as imagens em
`ghcr.io`.

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

- Antes de **remover**, a RF-14 exige a busca de leitores anexada ao commit. Documentação
  não é evidência de que ninguém lê (P-11)
- Antes de **acrescentar**, o estado precisa ter escritor e leitor declarados: P-07 proíbe
  estado órfão, e o teste declarativo da T053 compara esta lista com os estados que as
  transições T1–T11 conseguem produzir

A lista está em **dois** arquivos, `index.js` (CommonJS) e `index.mjs` (ESM), porque
CommonJS não consegue `require` de ESM e este pacote não tem etapa de build. `npm test`
compara as duas e reprova se divergirem — é o que impede a fonte única de passar a ter
duas versões em silêncio.
