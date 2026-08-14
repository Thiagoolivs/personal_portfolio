# Mídia dos projetos (GIFs / vídeos)

Esta pasta guarda as demonstrações de cada sistema rodando. Enquanto um arquivo
não existe, o card e o dossiê mostram um slot vazio elegante — o site pode ser
publicado sem nenhum GIF aqui.

## Como adicionar

1. Grave a tela do sistema em funcionamento (10–20 s bastam).
2. Exporte como `.gif` (ou `.mp4` / `.webm`, que pesam bem menos).
3. Salve **nesta pasta** com o nome do slug do projeto:

| Projeto             | Arquivo esperado                  |
|---------------------|-----------------------------------|
| Pesquisa AI         | `pesquisa-ai.gif`                 |
| TalentMatch AI      | `talentmatch-ai.gif`              |
| ChargeGrid AI       | `chargegrid-ai.gif`               |
| Leitor de Canhotos  | `leitor-canhotos.gif`             |
| MultiTelas          | `multitelas.gif`                  |
| OrbitGuard AI       | `orbitguard.gif`                  |
| Questly             | `questly.gif`                     |
| NaviGo              | `navigo.gif`                      |

4. Abra `assets/js/projects.js`, ache o projeto e troque:

```js
media: null,
```

por

```js
media: "assets/media/pesquisa-ai.gif",
```

5. Se usou vídeo em vez de GIF, ajuste também a linha seguinte:

```js
media: "assets/media/pesquisa-ai.mp4",
mediaType: "video",
```

O vídeo entra com `autoplay muted loop playsinline` — comporta-se como GIF,
mas com uma fração do peso.

## Recomendações

- **Proporção 16:9 ou 16:10** — é o formato dos slots.
- **Largura de 1280 px** já é suficiente; acima disso só engorda o arquivo.
- **GIF abaixo de 3 MB.** Passou disso, converta para `.mp4`:

```bash
ffmpeg -i entrada.mov -vf "scale=1280:-2,fps=20" -c:v libx264 -crf 28 -an saida.mp4
```

- Comece a gravação já dentro da tela mais impressionante do sistema —
  ninguém espera o loading de um GIF de portfólio.
