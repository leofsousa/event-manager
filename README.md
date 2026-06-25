# Event Manager

Sistema web para gerenciamento de eventos, operações, escalas e viagens operacionais.

O objetivo do projeto é centralizar o planejamento operacional da equipe, permitindo o cadastro de eventos, visualização em agenda, controle de colaboradores e gerenciamento de viagens.

---

## Tecnologias

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Vercel

---

## Funcionalidades Implementadas

### Autenticação

- Login via Supabase Auth
- Controle de acesso por perfil
- Perfis:
  - Admin
  - Colaborador

### Dashboard

- Visualização da agenda operacional
- Destaque para eventos do dia
- Navegação entre períodos

### Eventos

- Cadastro de eventos
- Edição de eventos
- Exclusão de eventos
- Campos atuais:
  - Nome
  - Tipo
  - Data
  - Local
  - Observações
  - Canal

### Colaboradores

- Cadastro de colaboradores
- Edição de colaboradores
- Exclusão de colaboradores
- Ordenação por:
  - Nome
  - Cargo

### Escalas

- Associação de colaboradores aos eventos
- Controle de escalas por evento

### Viagens

- Cadastro de viagens
- Vinculação de eventos a viagens
- Visualização na agenda operacional

### Interface

- Tema claro e escuro
- Layout responsivo
- Componentes reutilizáveis

---

## Estrutura do Projeto

```txt
app/
│
├── dashboard/
│   ├── page.tsx
│   ├── eventos/
│   ├── colaboradores/
│   ├── viagens/
│   └── escalas/
│
├── colaborador/
│
├── login/
│
components/
│
├── calendar/
├── colaboradores/
├── eventos/
├── viagens/
├── escalas/
└── ui/
│
context/
│
├── auth-context.tsx
│
lib/
│
├── supabase.ts
│
types/
│
├── type-event.ts
```

---

## Banco de Dados

### Tabelas principais

#### profiles

```sql
id
username
cargo
role
```

#### events

```sql
id
nome
tipo
data
local
observacoes
channel_id
viagem_id
```

#### channels

```sql
id
sigla
```

#### event_shifts

```sql
id
event_id
profile_id
```

#### viagens

```sql
id
nome
data_saida
data_retorno
```

---

## Roadmap

### Curto Prazo

- [ ] Melhorar visualização de viagens na agenda
- [ ] Ajustar timeline operacional
- [ ] Otimizar carregamento das páginas
- [ ] Melhorar experiência mobile

### Médio Prazo

- [ ] Campo de horário de início
- [ ] Campo de observações avançadas
- [ ] Controle de conflito de escalas
- [ ] Cadastro completo de colaboradores

### Longo Prazo

- [ ] Relatórios operacionais
- [ ] Exportação Excel
- [ ] Resumo mensal automático
- [ ] Exclusão automática de eventos antigos
- [ ] Dashboard analítico

---

## Funcionalidades Futuras Planejadas

### Gestão Avançada de Colaboradores

- Cadastro centralizado de colaboradores
- Foto de colaborador
- Histórico de participação em eventos

### Controle de Escalas

- Validação de conflitos
- Avisos de sobreposição de eventos

### Relatórios

- Quantidade de eventos por tipo
- Quantidade de operações por período
- Relatório mensal exportável

### Viagens

- Dias de deslocamento
- Visualização contínua estilo timeline
- Eventos agrupados por viagem

---

## Projeto Mobile (Planejado)

Será desenvolvido um aplicativo React Native para colaboradores.

Objetivo inicial:

- Login
- Visualização da agenda
- Consulta de escalas
- Consulta de viagens

Utilizará o mesmo banco de dados Supabase da aplicação web.

---

## Como Executar

### Instalar dependências

```bash
npm install
```

### Rodar ambiente local

```bash
npm run dev
```

### Build de produção

```bash
npm run build
```

### Iniciar produção

```bash
npm start
```

---

## Autor

Desenvolvido por Leonardo Felipe de Sousa.

Projeto em evolução contínua com foco em gestão operacional, escalas e planejamento de eventos.
