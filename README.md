# Dashboard Financeira — Fase 15.1

Esta entrega substitui integralmente a direção anterior baseada em Supabase.

A arquitetura passa a ser:

```text
Next.js 16
    ↓ HTTP + cookies HttpOnly
NestJS 11 + Fastify
    ↓ Prisma ORM 7
PostgreSQL 17 em Docker
```

O banco fica salvo no volume Docker `finance_postgres_data`. Parar ou reiniciar o container não apaga os dados. O volume só é removido ao executar `docker compose down -v` ou o script de reset.

## Estrutura da entrega

```text
frontend/
├── app/
├── components/
├── content/
├── lib/
├── types/
├── .env.example
├── Dockerfile
├── next.config.ts
└── package.json

backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── src/
├── .env.example
├── Dockerfile
├── package.json
└── prisma.config.ts

scripts/
.github/
docker-compose.yml
01_CONFIGURAR_LOCAL.cmd
02_RODAR_BACKEND.cmd
03_RODAR_FRONTEND.cmd
README.md
FASE_15_PLANO.md
```

## Aplicação sobre o projeto

1. Extraia o ZIP diretamente na raiz do projeto.
2. Confirme que `frontend/` e `backend/` permaneçam como pastas irmãs.
3. Permita a substituição somente dos arquivos presentes no pacote.
4. Execute:

```powershell
.\01_CONFIGURAR_LOCAL.cmd
```

Esse comando:

- remove os arquivos da implementação Supabase;
- cria `backend/.env`;
- cria `frontend/.env.local`;
- inicia o PostgreSQL;
- instala o backend;
- gera o Prisma Client;
- aplica a migration;
- cria o usuário inicial;
- instala o frontend.

## Iniciar diariamente

Abra dois terminais:

```powershell
.\02_RODAR_BACKEND.cmd
```

```powershell
.\03_RODAR_FRONTEND.cmd
```

Endereços:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:3001/api/v1
Swagger:  http://localhost:3001/api/v1/docs
Health:   http://localhost:3001/api/v1/health
```

Credenciais iniciais:

```text
E-mail: lenon@ateliux.com.br
Senha: financeiro2026
```

Troque a senha na primeira utilização.

## Somente banco no Docker

Este é o modo recomendado durante o desenvolvimento no Windows porque mantém hot reload mais rápido:

```powershell
docker compose up -d postgres
```

O frontend em `frontend/` e o backend em `backend/` rodam pelo Node instalado no computador.

## Backend também no Docker

Opcionalmente:

```powershell
docker compose --profile api up -d --build
```

Nesse modo, o backend usa a rede interna do Docker e se conecta ao serviço `postgres`.

## Acesso visual ao PostgreSQL

```powershell
docker compose --profile tools up -d pgadmin
```

Acesse `http://localhost:5050`.

```text
E-mail: admin@ateliux.local
Senha: financeiro2026
Servidor: postgres
Porta: 5432
Banco: finance_dashboard
Usuário: finance_user
Senha: finance_local_password
```

## Comandos do frontend

```powershell
cd frontend
npm install
npm run typecheck
npm run build
npm run dev
```

## Comandos do backend

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name nome_da_migration
npm run prisma:deploy
npm run prisma:seed
npm run prisma:studio
npm run typecheck
npm run build
```

## Persistência e segurança

- Senhas armazenadas com bcrypt, nunca em texto puro.
- Access token em cookie HttpOnly de curta duração.
- Refresh token rotativo e armazenado no banco somente como hash SHA-256.
- Cada dispositivo gera uma sessão separada e revogável.
- Convites são armazenados somente como hash.
- Permissões são verificadas no backend.
- A base já utiliza `workspaceId` e papéis para futura evolução multiusuário/SaaS.
- O frontend não recebe nem armazena tokens no `localStorage`.

## Recuperação de senha local

Como o projeto ainda não possui provedor de e-mail, `/recuperar-senha` retorna um token somente em desenvolvimento. A própria tela permite seguir para `/redefinir-senha`.

Em produção, o backend deixa de retornar o token e ele deverá ser enviado por um provedor de e-mail.

## Remover a implementação Supabase manualmente

```powershell
.\scripts\REMOVER_FASE_15_SUPABASE.ps1
```

## Reset completo do banco

```powershell
.\scripts\RESETAR_BANCO.ps1
```

Essa operação apaga definitivamente os dados locais do volume PostgreSQL.

## Próxima entrega

A Fase 15.2 conectará ao banco:

- categorias;
- contas;
- lançamentos;
- transferências;
- contas a pagar;
- recebimentos;
- cálculos da Visão Geral.

Consulte `FASE_15_PLANO.md` para o planejamento completo.

## Sobre a PWA da entrega anterior

O script de configuração remove a PWA que havia sido criada junto da implementação Supabase, pois ela dependia de arquivos daquele pacote. A PWA será recolocada na Fase 15.5, depois que todos os módulos estiverem usando a API NestJS e o comportamento offline puder ser definido sem risco de sobrescrever dados do PostgreSQL.
