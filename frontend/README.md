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
- Fase 13: Autenticação, compartilhamento e permissões

## Rotas implementadas

### Autenticação

- `/login`
- `/registro`
- `/recuperar-senha`
- `/convite/[token]`

### Dashboard

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
- `/acessos`

A rota `/` direciona para `/login`. As rotas da dashboard continuam acessíveis diretamente durante a fase demonstrativa.

## Fase 13

A fase de autenticação, compartilhamento e permissões inclui:

- páginas responsivas de login, registro e recuperação de senha;
- alternativa visual para entrar ou criar conta com Google;
- fluxo demonstrativo de aceitação de convite;
- seletor de espaços financeiros no cabeçalho da dashboard;
- espaços pessoais e compartilhados sem mistura visual de contexto;
- identificação do papel atual no espaço selecionado;
- modo somente leitura ao selecionar um espaço no qual o usuário é visualizador;
- criação de espaços compartilhados;
- convite de pessoas por e-mail;
- permissões de proprietário, editor e somente leitura;
- alteração e remoção de participantes;
- reenvio e cancelamento de convites;
- matriz completa das permissões de cada papel;
- menu da conta com acesso às pessoas, configurações e saída;
- navegação lateral atualizada com o módulo Pessoas e acessos.

Nesta fase, autenticação, sessão, convites e permissões funcionam em modo demonstrativo no navegador. A proteção real das rotas, o envio de e-mails, o login Google e a persistência segura serão conectados ao backend e ao banco de dados na Fase 15.

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
