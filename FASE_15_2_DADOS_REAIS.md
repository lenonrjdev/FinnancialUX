# Fase 15.2 — Dashboard limpa e dados reais no PostgreSQL

Esta atualização remove os dados financeiros demonstrativos carregados automaticamente no frontend e conecta os módulos da dashboard ao backend NestJS com persistência no PostgreSQL.

## Comportamento após a atualização

- O primeiro acesso mostra saldos zerados, gráficos sem movimentações e listas vazias.
- Nenhuma conta, transação, cartão, cobrança, meta, dívida ou assinatura é criada automaticamente.
- Os dados aparecem somente depois que o usuário os cadastra.
- Cada espaço financeiro possui dados separados.
- Proprietários e editores podem salvar; visualizadores permanecem em modo somente leitura.
- Nome, e-mail, telefone, idioma e fuso horário são mantidos no cadastro do usuário.
- Preferências, notificações, segurança e backups ficam vinculados ao usuário ou ao espaço financeiro.

## Persistência adicionada

A tabela `workspace_data_documents` armazena documentos JSONB por espaço e módulo. A API disponibiliza:

```text
GET    /api/v1/finance-data
GET    /api/v1/finance-data/:module
PUT    /api/v1/finance-data/:module
DELETE /api/v1/finance-data/:module
```

Todas as chamadas são autenticadas e exigem o cabeçalho `X-Workspace-Id`.

## Aplicação da atualização

Extraia o ZIP diretamente na raiz do projeto, permitindo a substituição dos arquivos existentes. Depois execute:

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:deploy
npm run start:dev
```

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

Não é necessário apagar o banco. A migration adiciona a nova estrutura preservando usuário, sessão, preferências e espaços já criados.
