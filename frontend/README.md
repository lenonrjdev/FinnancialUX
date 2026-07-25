# Dashboard Financeira Pessoal

Projeto em Next.js, React, TypeScript e Tailwind CSS com organização por módulos.

## Fases implementadas

- Fase 1: Visão geral e estrutura da dashboard
- Fase 2: Lançamentos financeiros
- Fase 3: Contas, carteiras e transferências
- Fase 4: Cartões, limites, faturas e compras parceladas
- Fase 5: Contas a pagar e recebimentos
- Fase 6: Calendário financeiro
- Fase 7: Categorias e orçamentos mensais
- Fase 8: Metas e reservas financeiras

## Rotas implementadas

- `/visao-geral`
- `/lancamentos`
- `/contas`
- `/cartoes`
- `/contas-a-pagar`
- `/recebimentos`
- `/calendario`
- `/orcamentos`
- `/metas`

As demais rotas da sidebar continuam preparadas como páginas temporárias até suas respectivas fases.

## Organização

- `app`: páginas e rotas
- `components/<pagina>`: componentes pertencentes a cada página
- `content`: textos fixos da interface
- `data`: dados demonstrativos temporários
- `types`: tipagens TypeScript
- `lib`: utilitários compartilhados

## Execução

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Os dados das fases atuais permanecem em estado local e demonstrativo. A persistência e a sincronização entre módulos serão adicionadas na fase de banco de dados e integração final.
