# Dashboard Financeira Pessoal

Projeto em Next.js 16, React 19, TypeScript e Tailwind CSS para organização financeira pessoal.

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
- Fase 13: Autenticação, espaços compartilhados e permissões
- Fase 14: Configurações, segurança, histórico e backups

## Rotas implementadas

- `/login`
- `/registro`
- `/recuperar-senha`
- `/convite/[token]`
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
- `/configuracoes`

## Fase 14

O módulo de configurações inclui:

- edição de nome, e-mail, telefone e fuso horário;
- atualização imediata da identidade exibida no cabeçalho e na sidebar;
- moeda em real brasileiro, formato de data e início do mês financeiro;
- conta padrão e preferências de privacidade visual;
- aparência clara, escura ou sincronizada com o sistema;
- alertas de contas, recebimentos, orçamento, saldo e segurança;
- resumos semanais e mensais;
- alteração demonstrativa de senha e verificação em duas etapas;
- controle de tempo de sessão e proteção de exportações;
- listagem e encerramento de dispositivos conectados;
- histórico pesquisável e exportável de atividades;
- criação e download de backup completo em JSON;
- configuração de backups automáticos e retenção;
- validação de arquivo para restauração;
- solicitação demonstrativa de exclusão da conta.

## Organização

- `app`: páginas e rotas
- `components/<pagina>`: componentes pertencentes a cada página
- `content`: textos fixos da interface
- `data`: dados demonstrativos temporários
- `types`: tipagens TypeScript
- `lib`: regras e utilitários compartilhados

## Execução

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

As configurações são mantidas no `localStorage` para demonstração. Autenticação real, banco de dados, proteção de rotas, armazenamento de backups e persistência entre módulos serão finalizados na Fase 15.
