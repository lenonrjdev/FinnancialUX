# Dashboard Financeira Pessoal

Projeto em Next.js, React, TypeScript e Tailwind CSS para organização financeira pessoal.

## Fase atual

**Fase 3 — Contas, carteiras e transferências**

A aplicação já possui:

- Visão geral financeira responsiva;
- Sidebar com todos os módulos planejados;
- Módulo de lançamentos com receitas, despesas e transferências;
- Módulo de contas e carteiras em `/contas`;
- Resumo do saldo total, projetado, disponível e reservado;
- Busca e filtros por tipo de conta;
- Cadastro local de novas contas;
- Transferências internas com atualização dos dois saldos;
- Histórico de movimentações por conta;
- Distribuição proporcional do patrimônio;
- Layout completo para desktop, tablet e celular;
- Textos fixos separados em `/content`;
- Dados demonstrativos separados em `/data`;
- Componentes organizados por página.

## Executar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Validações

```bash
npm run typecheck
npm run lint
npm run build
```

Os dados desta fase permanecem no estado local do React e serão persistidos no banco de dados na fase de integração.
