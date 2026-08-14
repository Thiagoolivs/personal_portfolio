/* ============================================================================
   PROJETOS — fonte única de verdade do portfólio
   ----------------------------------------------------------------------------
   PARA ADICIONAR O GIF DE UM PROJETO:
     1. Grave a tela do sistema rodando e exporte como .gif (ou .mp4/.webm).
     2. Salve em  assets/media/  com o nome do slug. Ex.: assets/media/questly.gif
     3. Troque   media: null   por   media: "assets/media/questly.gif"
     4. (opcional) mediaType: "video" se for .mp4/.webm em vez de .gif
   Enquanto media for null, o card e o dossiê exibem um slot vazio elegante —
   nada quebra e o site pode ser publicado hoje.

   Campos:
     slug        identificador (usado no nome do arquivo de mídia e na URL #)
     name        nome de exibição
     tagline     uma linha — o que é
     year        período / contexto
     status      "Em produção" | "MVP" | "Concepção" | "Uso interno"
     accent      cor de destaque do card (hex)
     purpose     propósito — o problema que resolve
     how         array de passos: como funciona de ponta a ponta
     highlights  números / decisões técnicas que merecem destaque
     stack       grupos de tecnologias
     links       repo / live / docs
   ========================================================================== */

const PROJECTS = [
  /* ────────────────────────────────────────────────────────────── 01 */
  {
    slug: "pesquisa-ai",
    name: "Pesquisa AI",
    tagline: "Formulários que viram estatística e insight sozinhos.",
    year: "2026",
    status: "Em produção",
    accent: "#22d3ee",
    media: null,
    mediaType: "gif",
    purpose:
      "Empresas, escolas e equipes coletam pesquisas o tempo todo e param na planilha: os dados existem, mas ninguém tem tempo (ou repertório estatístico) para lê-los. O Pesquisa AI fecha esse ciclo — cria o formulário, coleta as respostas, calcula a estatística completa e ainda explica o resultado em linguagem natural.",
    how: [
      {
        t: "Criação do formulário",
        d: "O usuário monta perguntas numéricas, de múltipla escolha ou de texto livre e marca uma delas como pergunta principal — é ela que alimenta o painel estatístico."
      },
      {
        t: "Coleta ilimitada",
        d: "Cada resposta enviada é persistida no PostgreSQL e entra no cálculo em tempo real, sem etapa manual de tabulação."
      },
      {
        t: "Motor estatístico",
        d: "O dashboard calcula média, mediana, moda, desvio padrão, mínimo, máximo, amplitude e total, além de analisar distribuição e assimetria, renderizando tudo em gráficos interativos com Chart.js."
      },
      {
        t: "Importação de CSV",
        d: "Bases externas de até 20.000 linhas podem ser enviadas por upload e passam pelo mesmo pipeline de análise dos dados nativos."
      },
      {
        t: "Analista de IA",
        d: "Na rota /ia, um chat conectado ao Groq (Llama 3.1 8B) recebe o contexto do conjunto de dados e responde perguntas em português. Sem chave de API configurada, o sistema cai em um modo de fallback e continua funcionando."
      }
    ],
    highlights: [
      "Upload de CSV com até 20.000 linhas",
      "8 métricas estatísticas + assimetria e distribuição",
      "Fallback sem API: a IA degrada, o produto não",
      "Deploy com Gunicorn + PostgreSQL"
    ],
    stack: [
      { g: "Backend", i: ["Django 5", "Python", "Gunicorn"] },
      { g: "Dados", i: ["PostgreSQL", "Chart.js"] },
      { g: "IA", i: ["Groq API", "Llama 3.1 8B"] },
      { g: "Front", i: ["HTML", "CSS", "JavaScript"] }
    ],
    links: [
      { label: "Repositório", url: "https://github.com/Thiagoolivs/Pesquisa-AI", type: "repo" },
      { label: "Demo ao vivo", url: "https://pesquisa-ai-production.up.railway.app/pesquisa", type: "live" }
    ]
  },

  /* ────────────────────────────────────────────────────────────── 02 */
  {
    slug: "talentmatch-ai",
    name: "TalentMatch AI",
    tagline: "Recrutamento com score ponderado e ML de similaridade.",
    year: "2025 — 2026",
    status: "Em produção",
    accent: "#a855f7",
    media: null,
    mediaType: "gif",
    purpose:
      "Recrutar é comparar coisas incomparáveis: currículos em texto livre contra descrições de vaga em texto livre. O TalentMatch AI transforma essa comparação subjetiva em um score de 0 a 100% — e, quando o candidato não bate com a vaga, aponta exatamente qual habilidade está faltando e qual curso preenche o buraco.",
    how: [
      {
        t: "Três perfis, três jornadas",
        d: "Candidatos, Empresas (com validação de CNPJ) e Administradores têm áreas e permissões distintas — cada um enxerga só o que lhe cabe."
      },
      {
        t: "Normalização de habilidades",
        d: "Um catálogo de 66 skills canônicas padroniza variações de escrita antes de qualquer comparação, evitando que 'JS' e 'JavaScript' contem como coisas diferentes."
      },
      {
        t: "Algoritmo de matching ponderado",
        d: "Score = Habilidades×0,50 + Experiência×0,25 + Localização×0,15 + Salário×0,10. A parcela de habilidades combina match exato com similaridade TF-IDF (scikit-learn), capturando proximidade semântica entre stacks."
      },
      {
        t: "Gaps viram trilha de estudo",
        d: "As habilidades exigidas que faltam no perfil viram recomendação automática de cursos, com lições estruturadas e acompanhamento de progresso."
      },
      {
        t: "Chatbot de carreira",
        d: "Assistente com Groq (Llama 3.3 70B) analisa currículos em PDF e orienta o candidato; se a API cair, um motor local assume a conversa."
      },
      {
        t: "Operação e governança",
        d: "Painel administrativo com estatísticas, aprovação de empresas, fila de problemas reportados, modo de manutenção e log de auditoria das ações."
      }
    ],
    highlights: [
      "Score ponderado 50/25/15/10 com TF-IDF",
      "66 skills canônicas para normalização",
      "API REST completa em Django REST Framework",
      "Uploads em S3 e e-mail transacional via SMTP em produção"
    ],
    stack: [
      { g: "Backend", i: ["Django 5.2", "Django REST Framework", "Gunicorn", "WhiteNoise"] },
      { g: "IA / ML", i: ["scikit-learn (TF-IDF)", "Groq", "Llama 3.3 70B", "NumPy", "Pandas"] },
      { g: "Dados", i: ["PostgreSQL", "SQLite"] },
      { g: "Front", i: ["Tailwind CSS", "Chart.js", "JavaScript"] }
    ],
    links: [
      { label: "Repositório", url: "https://github.com/Thiagoolivs/talentmatch-ai", type: "repo" },
      { label: "Demo ao vivo", url: "https://talentmatch-ai-production-cb2b.up.railway.app/", type: "live" }
    ]
  },

  /* ────────────────────────────────────────────────────────────── 03 */
  {
    slug: "chargegrid-ai",
    name: "ChargeGrid AI",
    tagline: "RAG que responde suporte técnico de eletroposto em menos de 1s.",
    year: "2026 · EV Challenge — GoodWe",
    status: "MVP",
    accent: "#f59e0b",
    media: null,
    mediaType: "gif",
    purpose:
      "Os carregadores GoodWe HCA-G2 são robustos, mas o conhecimento técnico deles vive preso num manual PDF — e ninguém abre PDF no meio de um chamado. O ChargeGrid AI expõe esse conhecimento como API conversacional: o operador pergunta em português e recebe resposta fundamentada, com as fontes citadas, sem esperar suporte humano.",
    how: [
      {
        t: "1 · Retrieval",
        d: "A pergunta vira embedding e é buscada semanticamente num índice FAISS local, reforçada por keyword hints. Retornam os 8 trechos mais relevantes da base técnica."
      },
      {
        t: "2 · Augmentation",
        d: "Os trechos recuperados são injetados junto de um system prompt especializado, com temperature 0.1 para manter a resposta determinística — em suporte técnico, criatividade é defeito."
      },
      {
        t: "3 · Generation",
        d: "O contexto montado vai para o Groq com llama-3.3-70b-versatile, cuja infraestrutura LPU entrega latência P50 de ~800ms contra 2–4s das APIs concorrentes."
      },
      {
        t: "4 · Response",
        d: "A saída volta estruturada pela API REST em FastAPI, acompanhada das fontes que embasaram a resposta — o operador consegue auditar de onde veio a informação."
      },
      {
        t: "Cobertura do domínio",
        d: "A base cobre diagnóstico por LED e conectividade, custeio e faturamento por sessão, configuração de Dynamic Load Control, mais de 100 registros Modbus TCP e protocolos de segurança (RCBO, aterramento, IK10)."
      }
    ],
    highlights: [
      "Latência P50 de ~800ms na geração",
      "Recall de 98% na busca vetorial",
      "Embeddings de 384D locais (<5ms por documento)",
      "FAISS local: zero custo por query, zero dependência de nuvem"
    ],
    stack: [
      { g: "API", i: ["FastAPI", "Python", "REST + JSON"] },
      { g: "RAG", i: ["LangChain", "FAISS", "all-MiniLM-L6-v2"] },
      { g: "LLM", i: ["Groq", "llama-3.3-70b-versatile"] }
    ],
    links: [
      { label: "Repositório", url: "https://github.com/Thiagoolivs/chargedgrid-ai", type: "repo" }
    ]
  },

  /* ────────────────────────────────────────────────────────────── 04 */
  {
    slug: "leitor-canhotos",
    name: "Leitor de Canhotos",
    tagline: "De 24 horas de conferência manual para cerca de 1 hora.",
    year: "2026",
    status: "Uso interno",
    accent: "#34d399",
    media: null,
    mediaType: "gif",
    purpose:
      "Conciliar canhotos de nota fiscal era um ritual de 12 a 24 horas por lote: alguém separava centenas de folhas escaneadas e caçava a NF correspondente à mão. O sistema automatiza a leitura e a vinculação, e devolve ao humano apenas os casos que a máquina não conseguiu resolver — o trabalho cai para cerca de uma hora.",
    how: [
      {
        t: "Vigia a pasta do scanner",
        d: "O sistema monitora uma ou mais pastas (múltiplas filiais) e detecta novos PDFs assim que a impressora/scanner os deposita — não existe passo de importação manual."
      },
      {
        t: "Divide e lê",
        d: "PDFs multipágina são fatiados e cada canhoto é processado individualmente. A extração do número da NF tenta, em cascata: OCR com Tesseract, leitura de código de barras (zxing-cpp e pyzbar) e, como último recurso, IA."
      },
      {
        t: "Fallback com IA",
        d: "Leituras de baixa confiança são enviadas ao Groq (Llama 3.3) para extrair o número. Há rotação entre duas chaves de API e o fallback pode ser desligado por variável de ambiente."
      },
      {
        t: "Concilia automaticamente",
        d: "Encontrada a nota correspondente, o canhoto é marcado como recebido. Casos de alta confiança são vinculados sozinhos; folhas divisórias (uma folha cobrindo várias notas) têm tratamento próprio."
      },
      {
        t: "Fila de revisão humana",
        d: "O que não foi identificado cai em Revisão, separado por tipo. O operador digita o número e o sistema finaliza a vinculação. Erros de leitura vão para uma fila própria com reprocessamento em um clique."
      },
      {
        t: "Dashboard de pendências",
        d: "Alertas de notas aguardando canhoto há mais de um mês colocam a operação em ordem de prioridade, não em ordem de chegada."
      }
    ],
    highlights: [
      "Redução de 12–24h para ~1h por lote",
      "Cascata OCR → barcode → IA antes de pedir ajuda humana",
      "Processamento assíncrono com Celery + Redis",
      "Sobe inteiro com um docker-compose up"
    ],
    stack: [
      { g: "Backend", i: ["Django 4.2", "Python", "Celery", "Redis"] },
      { g: "Visão / OCR", i: ["Tesseract", "pdfplumber", "zxing-cpp", "pyzbar"] },
      { g: "IA", i: ["Groq", "Llama 3.3"] },
      { g: "Infra", i: ["PostgreSQL", "Docker Compose", "Bootstrap 5"] }
    ],
    links: [
      { label: "Repositório", url: "https://github.com/Thiagoolivs/leitor_canhotos", type: "repo" }
    ]
  },

  /* ────────────────────────────────────────────────────────────── 05 */
  {
    slug: "multitelas",
    name: "MultiTelas",
    tagline: "Digital signage corporativo que roda direto na Smart TV.",
    year: "2026",
    status: "Em produção",
    accent: "#38bdf8",
    media: null,
    mediaType: "gif",
    purpose:
      "Mídia indoor corporativa costuma exigir servidor, licença e um técnico para trocar um aviso. O MultiTelas inverte isso: é HTML, CSS e JavaScript puros, sem backend obrigatório, que qualquer pessoa opera pelo painel — abre o player na TV e pronto. Uma TV, várias zonas independentes, conteúdo diferente em cada uma ao mesmo tempo.",
    how: [
      {
        t: "Painel e player separados",
        d: "index.html é o painel de gestão; player.html é o que fica aberto na TV. O operador escolhe um dos 8 templates, clica direto no desenho da TV para selecionar a zona (cabeçalho, principal, lateral, rodapé) e adiciona conteúdo com prévia ao vivo."
      },
      {
        t: "Cerca de 23 tipos de conteúdo",
        d: "Avisos em 9 variantes, comunicados, imagem com upload, vídeo MP4, YouTube e lives, entrada HDMI/USB via captador, stream IPTV/HLS, captura de tela, clima, trânsito (Waze), mapa (OpenStreetMap), aniversários, agenda, KPI, frase do dia, promoções, redes sociais, relógio, QR Code e notícias por RSS — tudo sem chave de API."
      },
      {
        t: "Layout inteligente",
        d: "Um aviso marcado como Destaque ou Urgente se amplia sobre a tela e depois recolhe, sem interromper o vídeo ou a live que roda por baixo. As cores do tema se adaptam à imagem em exibição."
      },
      {
        t: "Agendamento e playlists",
        d: "Itens podem ser arrastados para reordenar, duplicados, favoritados e agendados por data, hora e dia da semana, distribuídos em vários painéis nomeados e protegidos por PIN."
      },
      {
        t: "Atualização centralizada",
        d: "O painel exporta um config.json; cada TV aponta para essa URL remota e busca a atualização sozinha no intervalo definido. Uma pessoa edita num lugar e a rede inteira de telas acompanha."
      },
      {
        t: "Controle pelo celular",
        d: "Com o servidor Node no ar, o player aberto com ?cloud=1 mostra um código de pareamento. Pareada a TV a uma conta, o conteúdo salvo no celular chega na hora via SSE. Usa PostgreSQL quando há DATABASE_URL e cai no SQLite embutido quando não há."
      },
      {
        t: "Tolerância a falha",
        d: "Um conteúdo com erro não derruba a exibição: o player isola cada item e pula para o próximo."
      }
    ],
    highlights: [
      "~23 tipos de conteúdo e 9 temas com editor de cores",
      "Zero dependências npm — sobe no Railway sem configurar nada",
      "Push em tempo real para a TV via SSE",
      "Funciona offline: dados em localStorage"
    ],
    stack: [
      { g: "Front", i: ["JavaScript (vanilla)", "HTML", "CSS"] },
      { g: "Servidor", i: ["Node.js", "SSE", "PostgreSQL", "node:sqlite"] },
      { g: "Integrações", i: ["RSS", "HLS/IPTV", "OpenStreetMap", "Waze", "YouTube"] }
    ],
    links: [
      { label: "Repositório", url: "https://github.com/Thiagoolivs/Multi-telas", type: "repo" }
    ]
  },

  /* ────────────────────────────────────────────────────────────── 06 */
  {
    slug: "orbitguard",
    name: "OrbitGuard AI",
    tagline: "Dados satelitais viram alerta climático num centro de operações.",
    year: "2026",
    status: "MVP",
    accent: "#60a5fa",
    media: null,
    mediaType: "gif",
    purpose:
      "Dado climático bruto não previne nada — alguém precisa olhar, cruzar e decidir. O OrbitGuard AI transforma leituras de satélite e estações em um índice de risco por região, com mapa, medidores e alertas de seca, queimada e temperatura extrema, na estética de um centro de operações de missão espacial.",
    how: [
      {
        t: "Coleta de dados reais",
        d: "O backend consome a API Open-Meteo via httpx e persiste cada leitura (temperatura, umidade, vento) no PostgreSQL, montando o histórico das regiões monitoradas."
      },
      {
        t: "Regiões pré-carregadas",
        d: "Ao subir, o backend cria as tabelas e popula automaticamente quatro regiões — São Paulo, Manaus, Porto Alegre e Recife — para que o dashboard já nasça com dados."
      },
      {
        t: "Motor de risco",
        d: "Uma engine baseada em regras classifica o nível: temperatura acima de 35 °C com umidade abaixo de 40% é risco ALTO; acima de 30 °C com umidade abaixo de 50% é MÉDIO; o resto é BAIXO. Um risk_score de 0 a 100 combina calor, secura e vento."
      },
      {
        t: "Pronto para virar ML",
        d: "A RiskEngine é uma interface: treinando o modelo com scikit-learn (python -m app.ml.train), basta trocar a implementação para MLRiskEngine — que ainda faz fallback para as regras se o modelo não existir."
      },
      {
        t: "Dashboard operacional",
        d: "O front em React polls a API por hook próprio e renderiza mapa interativo do Brasil (Leaflet) colorido por risco, painel de indicadores, medidor circular, alertas visuais e tabela de histórico."
      }
    ],
    highlights: [
      "Dados climáticos reais via Open-Meteo",
      "Arquitetura em camadas: api / services / models / schemas",
      "Motor de risco plugável — regras hoje, ML amanhã",
      "Sobe completo com docker compose up --build"
    ],
    stack: [
      { g: "Front", i: ["React", "Vite", "TypeScript", "TailwindCSS", "Leaflet"] },
      { g: "Backend", i: ["FastAPI", "SQLAlchemy 2.0", "Pydantic", "httpx"] },
      { g: "Dados / IA", i: ["PostgreSQL 16", "scikit-learn", "Open-Meteo"] },
      { g: "Infra", i: ["Docker", "Docker Compose"] }
    ],
    links: [
      { label: "Repositório", url: "https://github.com/Thiagoolivs/OrbitGuard", type: "repo" }
    ]
  },

  /* ────────────────────────────────────────────────────────────── 07 */
  {
    slug: "questly",
    name: "Questly",
    tagline: "Desafio de evolução para casais, com regra de jogo justa.",
    year: "2026",
    status: "MVP",
    accent: "#f472b6",
    media: null,
    mediaType: "gif",
    purpose:
      "Aplicativo de hábito costuma punir quem falha um dia e, por isso, é abandonado na primeira quebra. O Questly transforma um desafio de evolução de 30 dias em jogo entre duas pessoas e recompensa constância, não perfeição: não existe pontuação negativa — o foco é recuperar e continuar.",
    how: [
      {
        t: "Cinco categorias",
        d: "Física, Mental, Social, Espiritual e Relação (casal). Os hábitos fixos são configuráveis e valem 10 pontos cada."
      },
      {
        t: "Sorteio determinístico",
        d: "O desafio do dia é sorteado de forma determinística pela data — os dois jogadores recebem exatamente o mesmo desafio, o que torna a competição justa. Desafios surpresa aparecem com frequência ajustável."
      },
      {
        t: "Economia de pontos",
        d: "Hábito fixo 10 pts, desafio do dia 30, surpresa 20 e bônus de 20 por fechar tudo — máximo de 120 pontos num dia com surpresa. Dia concluído alimenta a sequência; dia perfeito garante o bônus."
      },
      {
        t: "Progressão e conquistas",
        d: "Streaks, dias perfeitos, percentual de conclusão, ranking diário/semanal/total e 11 conquistas com barra de progresso — incluindo a Casal Inabalável."
      },
      {
        t: "API agregada",
        d: "O backend FastAPI expõe /api/state, um payload único que monta a tela inicial inteira, além de rotas de ranking, histórico, conquistas, perfil e configurações. Banco SQLite e os dois jogadores nascem no primeiro boot."
      },
      {
        t: "Instalável no celular",
        d: "O front é React 18 com Vite e vite-plugin-pwa: mobile-first, tema escuro gamificado e instalável na tela inicial como app."
      }
    ],
    highlights: [
      "Sorteio determinístico por data = competição justa",
      "11 conquistas com progresso incremental",
      "Sem pontuação negativa por decisão de produto",
      "PWA instalável, mobile-first"
    ],
    stack: [
      { g: "Backend", i: ["FastAPI", "SQLAlchemy 2", "Pydantic", "SQLite"] },
      { g: "Front", i: ["React 18", "Vite", "React Router", "PWA"] }
    ],
    links: [
      { label: "Repositório", url: "https://github.com/Thiagoolivs/Questly", type: "repo" }
    ]
  },

  /* ────────────────────────────────────────────────────────────── 08 */
  {
    slug: "navigo",
    name: "NaviGo",
    tagline: "Copiloto de viagens em grupo — do orçamento ao check-in.",
    year: "2026",
    status: "Concepção",
    accent: "#c084fc",
    media: null,
    mediaType: "gif",
    purpose:
      "Viagem em grupo hoje é uma colcha de retalhos: WhatsApp, planilha, papel, PIX manual e ligação. O resultado é cobrança esquecida, informação perdida e estresse do organizador. O NaviGo centraliza a jornada inteira num só lugar — a proposta não é vender software, é vender tranquilidade para líderes de igreja, professores, famílias e organizadores independentes.",
    how: [
      { t: "1 · Criar viagem", d: "Nome, destino, datas, tipo e número de participantes." },
      { t: "2 · Assistente de IA", d: "Perguntas simples montam a estrutura da viagem para quem nunca organizou uma." },
      { t: "3 · Orçamento", d: "Os custos entram e o sistema calcula automaticamente o valor por pessoa." },
      { t: "4 · Pagamentos", d: "PIX com QR Code, baixa automática e lembretes de cobrança." },
      { t: "5 · Convites", d: "Link público, página da viagem e QR Code de inscrição." },
      { t: "6 · Painel", d: "Participantes, vagas, inadimplentes, checklist e tarefas num painel único." },
      { t: "7 · Dia da viagem", d: "Check-in por QR Code e confirmação de presença." },
      { t: "8 · Pós-viagem", d: "Relatórios, avaliações e a função duplicar viagem para a próxima edição." }
    ],
    highlights: [
      "Fase atual: concepção — arquitetura, modelo de dados e roadmap documentados",
      "PWA: uma base de código para navegador e celular",
      "Integração PIX via PSP brasileiro, com LGPD considerada no desenho",
      "Documentação completa: PRODUTO, ARQUITETURA, MODELO-DE-DADOS e ROADMAP"
    ],
    stack: [
      { g: "Front (PWA)", i: ["Ionic", "React", "TypeScript", "Vite", "Web Push"] },
      { g: "Backend", i: ["Django + DRF", "Celery", "Redis", "PostgreSQL"] },
      { g: "Integrações", i: ["PIX (PSP)", "LLM", "Resend", "WhatsApp"] }
    ],
    links: [
      { label: "Repositório", url: "https://github.com/Thiagoolivs/NaviGo", type: "repo" }
    ]
  }
];

/* ============================================================================
   STACK — seção 02
   ========================================================================== */
const STACK_GROUPS = [
  {
    title: "Backend",
    items: ["Python", "Django 5", "Django REST Framework", "FastAPI", "SQLAlchemy 2", "Pydantic", "Node.js", "Celery + Redis", "Gunicorn / Uvicorn"]
  },
  {
    title: "Front-end",
    items: ["React 18", "TypeScript", "Vite", "Ionic", "Tailwind CSS", "Bootstrap 5", "JavaScript (ES6+)", "PWA", "Three.js", "GSAP"]
  },
  {
    title: "IA & Dados",
    items: ["RAG", "LangChain", "FAISS", "Embeddings (MiniLM)", "Groq / Llama 3.x", "scikit-learn (TF-IDF)", "Tesseract OCR", "NumPy · Pandas", "Chart.js"]
  },
  {
    title: "Infra & Deploy",
    items: ["PostgreSQL", "SQLite", "Docker · Compose", "Railway", "Render", "GitHub Actions", "WhiteNoise · S3", "Linux"]
  }
];

/* Palavras da faixa rolante do hero */
const MARQUEE_WORDS = [
  "Python", "Django", "FastAPI", "React", "TypeScript", "RAG", "PostgreSQL",
  "Docker", "LLM", "OCR", "scikit-learn", "PWA", "Three.js", "Railway", "Celery"
];
