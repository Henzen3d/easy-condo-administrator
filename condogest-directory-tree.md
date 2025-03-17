# Estrutura do Projeto CondoGest

## Visão Geral da Estrutura

A estrutura do projeto CondoGest é organizada em pastas e arquivos que seguem um padrão de nomenclatura e organização. A seguir, descrevemos a estrutura básica do projeto:

## Estrutura de Telas e Fluxos

### 1. Autenticação
- **Login**: Layout dividido (50/50)
  - Lado esquerdo: Logo, slogan e benefícios
  - Lado direito: Formulário de login, opção demo, link para registro
- **Registro**: Formulário de criação de conta

### 2. Layout Principal
- **Barra Superior**: Pesquisa, toggle de tema, notificações, perfil
- **Menu Lateral**: Retrátil, convertido para abas em mobile
  - Dashboard
  - Unidades e Moradores
  - Transações
  - Contas Bancárias
  - Cobranças
  - Menu "Mais" (três pontos)
    - Utilities
    - Relatórios
    - Configurações

### 3. Dashboard
- Cards de resumo financeiro
- Gráficos de fluxo e categorias
- Transações recentes
- Contadores de unidades/moradores/contas

### 4. Unidades e Moradores
- Listagem em tabela com filtros
- Formulário de cadastro/edição
- Detalhes do morador

### 5. Contas Bancárias
- Cards de contas com detalhes
- Formulário de cadastro/edição
- Transferência entre contas

### 6. Transações
- Listagem em tabela com filtros e abas
- Formulário de registro
- Detalhes da transação

### 7. Cobranças
- Listagem em tabela
- Geração de faturamento
- Cadastro de cobranças avulsas
- Configuração de taxas fixas
- Exportação (PDF/Excel)

### 8. Utilities
- Configuração de taxas (água/gás)  
- Registro de leituras
- Histórico de consumo

### 9. Relatórios
- Seletor de período
- Resumo financeiro
- Status de cobranças

### 10. Configurações
- Dados do condomínio
- Configurações financeiras
- Notificações
- Gestão de usuários
- Segurança

## Fluxos Principais

### Geração de Faturamento
```
Cobranças > Gerar Faturamento > Definir período e opções > Preview > Confirmar > Feedback
```

### Registro de Transações
```
Transações > Nova Transação > Preencher formulário > Confirmar > Atualização de saldos
```

### Cadastro de Morador
```
Moradores > Adicionar Morador > Formulário em etapas > Confirmar > Opção de enviar credenciais
```

### Leitura de Medidores
```
Utilities > Registrar Leitura > Selecionar tipo > Informar leitura atual > Registrar > Geração automática de cobrança
```
