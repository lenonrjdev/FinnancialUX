# Fase 15 — Backend real e integração definitiva

A antiga implementação com Supabase foi descartada. A Fase 15 foi dividida para evitar um backend grande, frágil e difícil de validar em uma única entrega.

## 15.1 — Fundação, autenticação e espaços — entregue

- NestJS 11 com Fastify.
- Prisma ORM 7 com adapter PostgreSQL.
- PostgreSQL 17 persistido em volume Docker.
- Autenticação real com cookies HttpOnly.
- Access token curto e refresh token rotativo.
- Sessões revogáveis armazenadas no banco.
- Recuperação local de senha.
- Usuários, preferências, espaços, participantes e convites.
- Papéis proprietário, editor e somente leitura.
- Histórico de auditoria.
- Swagger, validação, rate limit, CORS e health check.
- Login, registro, logout, recuperação e seleção de espaço integrados ao frontend.
- Pessoas e acessos integrados ao backend.

## 15.2 — Núcleo financeiro

- Categorias.
- Contas e carteiras.
- Lançamentos.
- Transferências transacionais.
- Contas a pagar.
- Recebimentos.
- Visão geral calculada no backend.
- Remoção dos mocks destes módulos.

## 15.3 — Crédito e planejamento

- Cartões.
- Faturas.
- Compras parceladas.
- Calendário financeiro.
- Orçamentos.
- Metas e reservas.

## 15.4 — Compromissos e inteligência financeira

- Dívidas e pagamentos.
- Assinaturas e cobranças.
- Relatórios.
- Projeções.
- Importação CSV/OFX.
- Regras automáticas.
- Histórico e backups locais.

## 15.5 — Consolidação para uso diário e futura publicação

- Todos os mocks removidos.
- Testes unitários, integração e e2e.
- Transações críticas e idempotência.
- Docker completo opcional para frontend, backend e banco.
- Rotina de backup e restauração do PostgreSQL.
- Observabilidade e logs.
- PWA e comportamento offline controlado.
- Checklist de futura publicação SaaS.
