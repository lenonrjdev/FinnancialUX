# Backend NestJS

## Primeiro uso

```powershell
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run start:dev
```

## API

Prefixo: `/api/v1`

### Autenticação

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me
GET    /auth/sessions
DELETE /auth/sessions/others
DELETE /auth/sessions/:sessionId
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/change-password
```

### Usuário

```text
PATCH /users/me
GET   /users/me/preferences
PATCH /users/me/preferences
```

### Espaços

```text
GET    /workspaces
POST   /workspaces
GET    /workspaces/:workspaceId
GET    /workspaces/:workspaceId/members
PATCH  /workspaces/:workspaceId/members/:memberId
DELETE /workspaces/:workspaceId/members/:memberId
GET    /workspaces/:workspaceId/invitations
POST   /workspaces/:workspaceId/invitations
POST   /workspaces/:workspaceId/invitations/:invitationId/resend
DELETE /workspaces/:workspaceId/invitations/:invitationId
GET    /workspaces/invitations/:token/details
POST   /workspaces/invitations/:token/accept
```
