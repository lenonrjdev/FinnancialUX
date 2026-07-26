# Fase 15.3 — Tema escuro e legibilidade tipográfica

## Objetivo

Corrigir o tema escuro em toda a dashboard financeira e aumentar somente os textos que estavam excessivamente pequenos, sem ampliar títulos e números que já possuíam boa hierarquia visual.

## Correções aplicadas

- camada escura sistêmica para todos os módulos existentes;
- cartões, painéis, tabelas, listas, formulários, menus, modais e estados vazios com superfícies escuras consistentes;
- cores de bordas, divisórias, campos e placeholders adequadas ao fundo escuro;
- textos primários, secundários e auxiliares com contraste correto;
- estados positivos, negativos e de atenção preservados com cores próprias;
- barras, linhas, legendas e marcadores dos gráficos adaptados para o tema escuro;
- sidebar, topbar, rodapé, menu do usuário e seletor de espaço alinhados à mesma paleta;
- aplicação do tema antes da primeira renderização para evitar flashes e blocos claros;
- acompanhamento automático da preferência escura/clara do sistema quando a opção `system` estiver ativa;
- cache visual local da aparência, mantendo o backend como persistência oficial da preferência;
- aumento de 30% em todas as declarações de fonte com tamanho original de até `11px`;
- títulos, valores principais e textos médios/grandes preservados.

## Arquivos alterados

```text
frontend/app/globals.css
frontend/app/layout.tsx
frontend/components/dashboard/dashboard-shell.tsx
frontend/lib/settings.ts
```

## Aplicação

Extraia este pacote diretamente na raiz do projeto e permita a substituição dos arquivos.

Depois, encerre o frontend e limpe o cache do Next.js:

```powershell
Remove-Item -Recurse -Force .\frontend\.next -ErrorAction SilentlyContinue
cd frontend
npm run dev
```

O backend não precisa de migration, seed ou reinicialização por causa desta fase.

## Validações estruturais

- arquivo CSS analisado sem erros de sintaxe;
- 423 de 423 seletores que possuíam superfícies claras receberam tratamento para o tema escuro;
- 556 declarações de textos pequenos foram aumentadas exatamente em 30%;
- nenhuma dependência foi adicionada;
- nenhuma estrutura do banco de dados foi alterada.
