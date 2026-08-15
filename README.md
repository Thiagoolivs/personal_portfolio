# Portfólio — Thiago de Oliveira Coelho Souza

Portfólio pessoal com um MacBook 3D interativo (WebGL) digitando código dos
projetos reais, grade de projetos e um dossiê completo por sistema: propósito,
funcionamento passo a passo, stack e links. Sem framework, sem build, sem
dependências de runtime.

**Stack:** HTML · CSS · JavaScript (vanilla) · Three.js · GSAP/ScrollTrigger · Node.js

---

## Rodando localmente

```bash
npm start
# http://localhost:8080
```

Não há `npm install` a fazer — o servidor usa apenas os módulos nativos do Node
e as bibliotecas estão versionadas em `assets/vendor/`.

Alternativa sem Node: `python3 -m http.server 8080`.

---

## Deploy no Railway

1. Suba este repositório para o GitHub.
2. No [Railway](https://railway.app): **New Project → Deploy from GitHub repo**.
3. O Railway detecta o `package.json`, não instala nada (zero dependências) e
   inicia com `node server.js`. O `railway.json` já define o start command e o
   healthcheck em `/health`.
4. Em **Settings → Networking**, clique em **Generate Domain**.

O servidor respeita a variável `PORT` — nenhuma configuração extra é necessária.

---

## Estrutura

```
personal_portfolio/
├── index.html                 # marcação da página inteira
├── server.js                  # servidor estático (zero dependências)
├── package.json               # start script + engines
├── railway.json               # builder, start command e healthcheck
└── assets/
    ├── css/style.css          # sistema de design completo
    ├── js/
    │   ├── projects.js        # ← DADOS dos projetos (edite aqui)
    │   ├── scene.js           # MacBook 3D + código digitado (SNIPPETS)
    │   └── main.js            # cursor, nav, cards, dossiê, animações
    ├── media/                 # GIFs das demos (veja o README de lá)
    └── vendor/                # three.min.js, gsap.min.js, ScrollTrigger.min.js
```

---

## Adicionando os GIFs das demos

Os cards e os dossiês já reservam o espaço da mídia — enquanto não há arquivo,
aparece um slot pontilhado com o caminho esperado. Para preencher:

1. Salve o arquivo em `assets/media/` com o slug do projeto
   (ex.: `assets/media/questly.gif`).
2. Em `assets/js/projects.js`, troque `media: null` por
   `media: "assets/media/questly.gif"`.
3. Se for vídeo, use `mediaType: "video"` — ele roda em loop, mudo, como um GIF,
   com uma fração do peso.

Detalhes, tabela de nomes e o comando `ffmpeg` de conversão estão em
[`assets/media/README.md`](assets/media/README.md).

---

## Editando o conteúdo

Praticamente tudo vive em **`assets/js/projects.js`**:

| O que mudar                       | Onde                                  |
|-----------------------------------|---------------------------------------|
| Adicionar/remover projeto         | array `PROJECTS`                      |
| Texto de propósito e passos       | campos `purpose` e `how`              |
| Tecnologias listadas no dossiê    | campo `stack`                         |
| Links (repo/demo)                 | campo `links`                         |
| Cor de destaque do card           | campo `accent`                        |
| Seção "Stack técnico"             | `STACK_GROUPS`                        |
| Faixa rolante do topo             | `MARQUEE_WORDS`                       |

Os trechos de código que aparecem na tela do MacBook ficam em `assets/js/scene.js`,
no array `SNIPPETS` (cada item tem `file`, `lang` e `code`).

Cabeçalho, textos do "Como eu trabalho" e contato ficam em `index.html`.

Cada projeto tem link direto: `.../#p-<slug>` abre o site já com o dossiê aberto
(ex.: `/#p-talentmatch-ai`) — útil para mandar num processo seletivo.

---

## Detalhes de implementação

- **Cena 3D**: MacBook modelado com primitivas (chassi, deck com teclado e
  trackpad desenhados em canvas, dobradiça e tela). A tela é uma `CanvasTexture`
  redesenhada conforme o código é digitado, com realce de sintaxe e cursor
  piscando — os trechos vêm dos projetos reais. Arrastar gira o notebook,
  clicar troca o trecho, a roda dá zoom e a tampa fecha conforme a página desce.
  Ao sair do hero o notebook some, para não competir com os cards.
- **Degradação graciosa**: sem WebGL, sem GSAP ou com
  `prefers-reduced-motion`, o site continua legível e navegável — o fundo vira
  gradiente estático e as animações são desligadas.
- **Performance**: `pixelRatio` limitado a 2, tela do notebook redesenhada só
  quando o texto muda (não a cada frame) e loop de render pausado quando a aba
  perde o foco. No celular o notebook recua e o arraste é desligado, para o
  gesto continuar sendo rolagem.
- **Acessibilidade**: cards operáveis por teclado, dossiê com foco preso,
  fechamento por `Esc`, navegação entre projetos por `←`/`→` e `aria-*`
  coerentes.
- **Segurança**: todo conteúdo dos dados é escapado antes de virar HTML e o
  servidor bloqueia path traversal.

---

## Contato

- **E-mail:** thiago.olivs.coelho@gmail.com
- **GitHub:** [@Thiagoolivs](https://github.com/Thiagoolivs)
- **LinkedIn:** [thiago-coelho-souza](https://www.linkedin.com/in/thiago-coelho-souza/)
