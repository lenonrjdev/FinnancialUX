# Fase 15.4 — Tema persistente em toda a dashboard

Esta atualização corrige a troca de tema que era perdida ao navegar entre os módulos.

## Causa corrigida

Cada rota recriava o `DashboardShell`. Durante essa recriação, a preferência antiga presente na sessão era reaplicada e podia sobrescrever o tema escolhido poucos instantes antes.

## Comportamento novo

- o tema escolhido é aplicado imediatamente no elemento `html`;
- a preferência é armazenada no navegador antes da troca de rota;
- a preferência também é sincronizada com o usuário no PostgreSQL;
- a navegação entre Visão geral, Lançamentos, Contas, Cartões e todos os demais módulos não redefine o tema;
- recarregar a página mantém o tema escolhido;
- o botão rápido alterna diretamente entre **Claro** e **Escuro**;
- a opção **Sistema** continua disponível em Configurações → Preferências;
- mudanças feitas na página de configurações são refletidas imediatamente no cabeçalho;
- o botão mostra lua no tema claro e sol no tema escuro, indicando a ação disponível;
- o controle também foi incluído no cabeçalho mobile;
- `color-scheme` é atualizado para inputs, selects, barras de rolagem e controles nativos acompanharem o tema.

## Aplicação

Extraia este ZIP diretamente na raiz do projeto e permita a substituição dos arquivos.

Depois limpe o cache e reinicie somente o frontend:

```powershell
Remove-Item -Recurse -Force .\frontend\.next -ErrorAction SilentlyContinue
cd frontend
npm run dev
```

Não existem alterações no backend, Prisma ou banco de dados nesta fase.
