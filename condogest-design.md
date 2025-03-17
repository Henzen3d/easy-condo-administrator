# UX/UI para Sistema de Gestão de Condomínios - CondoGest

## Resumo do Projeto

CondoGest é um sistema completo para administração de condomínios desenvolvido com React.js e Supabase. A aplicação oferece uma interface moderna e responsiva utilizando componentes Shadcn/UI, permitindo o gerenciamento eficiente de unidades, moradores, finanças e cobranças. O sistema possui autenticação robusta, persistência de dados e regras de acesso escaláveis graças à integração com o Supabase.

## Especificações de Design

### Tema e Paleta de Cores

- **Esquema Principal**: Tons de azul para transmitir confiança e profissionalismo
- **Esquema de Acentuação**: Verde para indicadores positivos (receitas, saldos), vermelho para indicadores negativos (despesas, inadimplência)
- **Suporte a Dark Mode e Light Mode**: Alternância simples através de toggle na barra superior

### Tipografia

- **Fonte Principal**: Inter (sem serifa, moderna e altamente legível)
- **Hierarquia Clara**: Títulos em peso 700, subtítulos em 600, texto normal em 400
- **Escalas Responsivas**: Tamanho de fonte adaptável para diferentes dispositivos

### Componentes e Elementos de Interface

- **Cards Elevados**: Para destacar informações importantes como saldos e estatísticas
- **Gráficos Interativos**: Visualizações de dados financeiros com tooltips informativos
- **Tabelas Responsivas**: Para listagem de transações, moradores e cobranças
- **Formulários Bem Estruturados**: Com validação em tempo real e feedback visual

## Estrutura de Telas

### Tela de Login (Layout Split)

**Área Esquerda (50%)**:
- Logo e nome do aplicativo (CondoGest) em destaque
- Slogan: "Sistema completo para administração de condomínios"
- Três blocos de benefícios com ícones:
  1. "Gestão Financeira Simplificada" - "Controle de receitas e despesas em um só lugar"
  2. "Cadastro de moradores" - "Gerencie unidades e moradores com facilidade"
  3. "Cobranças automatizadas" - "Emissão e controle de boletos simplificado"
- Fundo gradiente sutilmente animado

**Área Direita (50%)**:
- Título "Bem-vindo de volta"
- Subtítulo "Entre com sua conta para acessar o painel"
- Formulário de login com:
  - Campo de email com validação
  - Campo de senha com toggle de visibilidade
  - Checkbox "Lembrar de mim"
  - Botão "Entrar" (destaque visual)
- Separador "Ou continue com:"
- Botão "Acessar como demonstração" (estilo secundário)
- Link "Não tem uma conta? Registre-se"

### Layout Principal (Pós-Login)

**Barra Lateral**:
- Retrátil/expansível via botão de toggle
- Em modo retraído, mostra apenas ícones
- Em telas pequenas, converte-se para navegação por abas (estilo Spotify)
- Logo do aplicativo no topo
- Links principais:
  1. Dashboard (home)
  2. Moradores
  3. Transações
  4. Contas Bancárias
  5. Cobranças
- Menu "Mais" (três pontos) para acessar:
  - Gestão de Utilities
  - Configurações
  - Relatórios

**Barra Superior**:
- Campo de pesquisa à esquerda
- À direita:
  - Toggle Dark/Light Mode
  - Ícone de notificações/mensagens com badge
  - Avatar do usuário com dropdown (Perfil, Configurações, Sair)

### Dashboard

**Layout de Cards**:
- Linha superior: Cards de resumo financeiro
  - Saldo Total (todas as contas)
  - Receitas do Mês
  - Despesas do Mês
  - Taxa de Inadimplência (% com indicador visual)
- Área central:
  - Gráfico de linha interativo mostrando fluxo financeiro anual
  - Gráfico de pizza/donut mostrando categorias de despesas
- Área inferior:
  - Card de transações recentes (estilo extrato)
  - Cards com contadores (Total de Unidades, Total de Moradores, Total de Contas)

### Moradores

- Barra de ações no topo com:
  - Botão "Adicionar Morador"
  - Filtros rápidos (Bloco, Tipo)
  - Campo de busca específico
- Tabela principal com:
  - Nome do morador
  - Email/Telefone
  - Unidade/Bloco
  - Tipo (Proprietário/Morador)
  - Menu de ações (Ver, Editar, Excluir)
- Modal de adição/edição com:
  - Campos de cadastro organizados por seções
  - Validação em tempo real
  - Preview do cadastro

### Contas Bancárias

- Exibição em cards horizontais com:
  - Ícone/logo do banco
  - Nome da conta
  - Informações bancárias (Agência/Conta/Tipo)
  - Saldo em destaque
  - Chave PIX
  - Botões de ação (Editar, Excluir, Transferir)
- Modal de transferência entre contas

### Transações

- Filtros avançados no topo:
  - Por período
  - Por categoria
  - Por conta
  - Por status
- Abas para separar:
  - Receitas
  - Despesas
  - Transferências
  - Pendentes
- Tabela com:
  - Data
  - Descrição
  - Categoria (com ícone)
  - Conta
  - Valor (formatação colorida)
  - Status (tag visual)
  - Ações (Visualizar, Editar, Excluir)

### Cobranças

- Barra de ações no topo:
  - Botão "Gerar Faturamento"
  - Botão "Nova Cobrança"
  - Botão "Taxas Fixas"
  - Botão "Exportar"
- Tabela de cobranças com:
  - Unidade/Morador
  - Descrição
  - Valor
  - Vencimento
  - Status (Pendente, Pago, Atrasado)
  - Ações

### Gestão de Utilities

- Seção de configuração de taxas:
  - Valor do m³ de água
  - Valor do m³ de gás
- Formulário de registro de leituras:
  - Seletor de tipo (Água/Gás)
  - Campo de leitura anterior (preenchido automaticamente)
  - Campo de leitura atual
  - Data da leitura (default: hoje)
  - Botão "Registrar Leituras"
- Histórico de leituras anteriores em tabela

### Relatórios

- Seletor de período no topo
- Cards de relatórios disponíveis:
  - Resumo Financeiro
  - Status das Cobranças
- Visualização do relatório selecionado
- Opções de exportação (PDF, Excel)

### Configurações

- Menu lateral de navegação entre seções:
  - Condomínio
  - Financeiro
  - Notificações
  - Usuários
  - Segurança
- Formulários específicos para cada seção
- Botões de salvar/cancelar no final de cada seção

## Fluxos Importantes

### Geração de Faturamento

1. Usuário acessa "Cobranças" e clica em "Gerar Faturamento"
2. Modal solicita:
   - Mês de referência
   - Data de vencimento
   - Opção de incluir taxas fixas
   - Opção de incluir leituras de utilities
3. Preview das cobranças a serem geradas
4. Confirmação e processamento
5. Feedback de sucesso com resumo

### Registro de Novas Transações

1. Usuário acessa "Transações" e clica em "Nova Transação"
2. Formulário solicita:
   - Tipo (Receita/Despesa)
   - Descrição
   - Categoria
   - Valor
   - Data
   - Conta bancária
   - Comprovante (upload opcional)
3. Validação e confirmação
4. Atualização automática do saldo na conta selecionada

### Cadastro de Novo Morador

1. Usuário acessa "Moradores" e clica em "Adicionar Morador"
2. Formulário em múltiplas etapas:
   - Informações pessoais
   - Seleção/criação de unidade
   - Definição do tipo (Proprietário/Morador)
3. Validação e confirmação
4. Opção de enviar credenciais de acesso

## Responsividade

- **Desktop**: Layout completo com sidebar expansível
- **Tablet**: Sidebar retraída por padrão, adaptações de espaço
- **Mobile**:
  - Navegação convertida para abas inferiores (máximo 5)
  - Cards empilhados verticalmente
  - Tabelas com scroll horizontal ou visualização alternativa
  - Modais em tela cheia
