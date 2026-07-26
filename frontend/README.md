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
- Fase 9: Dívidas, empréstimos e parcelamentos
- Fase 10: Assinaturas e cobranças recorrentes
- Fase 11: Relatórios e projeção financeira
- Fase 12: Importação, exportação avançada e regras automáticas

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
- `/dividas`
- `/assinaturas`
- `/relatorios`
- `/dados-e-automacoes`

A rota de configurações continua preparada como página temporária até sua respectiva fase.

## Fase 12

O módulo de dados e automações inclui:

- importação de extratos CSV e OFX diretamente no navegador;
- detecção automática de colunas e ajuste manual do mapeamento;
- prévia editável antes da confirmação;
- identificação de linhas incompletas e possíveis duplicidades;
- aplicação de regras automáticas durante a importação;
- exportação em CSV ou JSON por módulo e período;
- backup completo dos dados demonstrativos;
- criação, edição, pausa, exclusão e ordenação de regras;
- teste das regras nos lançamentos atuais;
- histórico das importações realizadas na sessão.

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
