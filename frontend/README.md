# Dashboard Financeira Pessoal — Fase 1

Projeto completo em Next.js, React, TypeScript e Tailwind CSS.

## Rotas

- `/visao-geral`: dashboard implementada na Fase 1.
- `/lancamentos`, `/contas`, `/cartoes`, `/contas-a-pagar`, `/recebimentos`, `/calendario`, `/orcamentos`, `/metas`, `/dividas`, `/assinaturas`, `/relatorios` e `/configuracoes`: módulos preparados com telas temporárias.

## Organização

```text
app/                         páginas e rotas
components/dashboard/        estrutura compartilhada da dashboard
components/visao-geral/      componentes exclusivos da visão geral
components/modulos/          componentes das telas temporárias dos módulos
components/shared/           elementos reutilizáveis
content/                     textos fixos, títulos, labels e navegação
data/                        dados demonstrativos que serão substituídos pelo backend
lib/                         funções utilitárias
types/                       tipos compartilhados
```

## Executar

```bash
npm install
npm run dev
```

A rota `/` redireciona automaticamente para `/visao-geral`.
