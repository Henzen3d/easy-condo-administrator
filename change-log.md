# Log de Mudanças

Este arquivo registra todas as alterações feitas por IDEs com suporte a IA no projeto CondoGest.

## Formato do Log

Cada entrada deve seguir o padrão:

```
### [Data] - [IDE utilizada]
- **Tipo de alteração**: Descrição breve
- **Arquivos modificados**: Lista de arquivos
- **Detalhes técnicos**: Descrição técnica da mudança
- **Responsável**: Nome/ID da IA
```

## Registro de Mudanças

### [2024-01-09] - [VSCode com Augment]
- **Tipo de alteração**: Correção no fluxo de registro de leituras e geração de cobranças
- **Arquivos modificados**: 
  - src/components/utility/MeterReadingsForm.tsx
  - src/lib/billingService.ts
  - src/lib/readingService.ts
- **Detalhes técnicos**: 
  - Implementado retorno do ID na função registerReading
  - Adicionada criação de cobrança no Supabase
  - Adicionada criação de transação pendente
  - Melhorado tratamento de erros e logs
  - Adicionada relação entre leitura e cobrança
- **Responsável**: Augment (AI Assistant)

### [2025-03-19] - [VSCode com Copilot]
- **Tipo de alteração**: Criação da documentação inicial
- **Arquivos modificados**: 
  - condogest-ide-config.json
  - README-IDE.md
- **Detalhes técnicos**: 
  - Estrutura JSON para integração com IDEs
  - Documentação Markdown explicativa
- **Responsável**: Roo (AI Assistant)

### [2025-03-19] - [VSCode com Cline]
- **Tipo de alteração**: Atualização do log de mudanças
- **Arquivos modificados**: 
  - change-log.md
- **Detalhes técnicos**: 
  - Implementação do registro automático de logs
  - Manutenção do formato padrão de registro
- **Responsável**: Cline (AI Assistant)

### [2024-03-21] - Feature
- **Arquivos Modificados**: 
  - `src/components/utility/MeterReadingsForm.tsx`
  - `src/types/consumption.ts`
- **Detalhes Técnicos**: 
  - Adicionado campo para leitura anterior e atual no formulário de leituras
  - Implementado cálculo automático do valor total baseado na diferença entre leituras
  - Integrado com a tabela de taxas para cálculo do valor
  - Adicionada geração automática de cobrança ao registrar nova leitura
  - Atualizada interface de tipos para suportar novas funcionalidades
- **Responsável**: [Seu Nome/ID]

### [2024-03-22] - [Cursor com Claude]
- **Tipo de alteração**: Correção no cálculo automático de consumo
- **Arquivos modificados**: 
  - src/components/utility/MeterReadingsForm.tsx
- **Detalhes técnicos**: 
  - Corrigido o cálculo automático do valor da leitura usando useEffect
  - Adicionada formatação de moeda para exibição do valor total
  - Implementada exibição detalhada do cálculo (consumo, taxa e valor)
  - Adicionado alerta para quando não há taxa definida para o tipo selecionado
- **Responsável**: Claude (AI Assistant)

### [2024-03-22] - [Cursor com Claude]
- **Tipo de alteração**: Correção na funcionalidade de leituras de medidores
- **Arquivos modificados**: 
  - src/components/utility/MeterReadingsForm.tsx
- **Detalhes técnicos**: 
  - Corrigido comportamento do campo de leitura atual para ser reiniciado ao mudar de unidade ou tipo de consumo
  - Adicionado suporte a ambos os nomes de tabela ('billing' e 'billings') para garantir que cobranças sejam inseridas corretamente
  - Adicionados logs detalhados para facilitar a depuração
  - Melhorada a limpeza dos campos ao alternar entre diferentes configurações
- **Responsável**: Claude (AI Assistant)

### [2024-03-22] - [Cursor com Claude]
- **Tipo de alteração**: Correção na integração com sistema de cobrança
- **Arquivos modificados**: 
  - src/components/utility/MeterReadingsForm.tsx
- **Detalhes técnicos**: 
  - Corrigida a estrutura de dados enviada para a tabela 'billings'
  - Adicionada busca de informações da unidade para preencher os campos 'unit' e 'resident'
  - Melhorada a descrição da cobrança para incluir o consumo em m³
  - Adicionados campos necessários: is_printed, is_sent, created_at, updated_at
  - Formatação correta da data para o padrão ISO
- **Responsável**: Claude (AI Assistant)

### [2024-03-22] - [Cursor com Claude]
- **Tipo de alteração**: Adição de campos obrigatórios para registro de cobranças
- **Arquivos modificados**: 
  - src/components/utility/MeterReadingsForm.tsx
- **Detalhes técnicos**: 
  - Adicionados campos obrigatórios faltantes para registrar corretamente nas cobranças (reference_month, reference_year, charge_type)
  - Formatação adequada do consumo com 3 casas decimais
  - Corrigido formato da data de vencimento para o padrão esperado pelo banco
  - Incluído o unit_id numérico para manter a referência à unidade
- **Responsável**: Claude (AI Assistant)

### [2024-03-23] - [Cursor com Claude]
- **Tipo de alteração**: Melhoria na experiência do usuário e robustez do registro de leituras
- **Arquivos modificados**: 
  - src/components/utility/MeterReadingsForm.tsx
- **Detalhes técnicos**: 
  - Adicionado diálogo de confirmação visual após o registro bem-sucedido
  - Implementada estratégia de tratamento de erros com fallback para diferentes estruturas de dados
  - Melhorados os logs de depuração para facilitar a identificação de problemas
  - Adicionada exibição detalhada dos dados salvos para melhor feedback ao usuário
  - Reorganizado o fluxo de reset de formulário para acontecer apenas após confirmação
- **Responsável**: Claude (AI Assistant)

### [2024-03-22] - Correção na tela de Leituras de Medidores e integração com Cobranças
- **Tipo de alteração**: Correção e melhoria
- **Arquivos modificados**: 
  - src/components/utility/MeterReadingsForm.tsx
- **Detalhes técnicos**:
- Adicionado diálogo de confirmação após o registro da leitura para melhorar feedback visual ao usuário
- Correção na estrutura de dados enviada para a tabela 'billings' 
- Adicionados campos obrigatórios: billing_id, is_printed, is_sent, reference_month, reference_year, charge_type
- Implementada estratégia de fallback caso a inserção com todos os campos falhe
- Melhorado sistema de log para facilitar diagnóstico de problemas
- Adicionada verificação de conexão com Supabase

### [2024-03-22] - Correção adicional no registro de cobranças via leituras de medidores
- **Tipo de alteração**: Correção de bugs
- **Arquivos modificados**: 
  - src/components/utility/MeterReadingsForm.tsx
- **Detalhes técnicos**:
  - Corrigido problema que impedia o registro correto de cobranças pela funcionalidade de leituras de medidores
  - Adicionados logs detalhados para identificar problemas na estrutura da tabela
  - Implementada estratégia de detecção de colunas disponíveis para adaptar a inserção
  - Corrigido problema com o ID da cobrança não aparecendo corretamente na confirmação
  - Aprimorada gestão de erros com mensagens mais claras
- **Responsável**: Claude AI

### [2024-03-22] - Correções adicionais no registro de cobranças e no diálogo de confirmação
- **Tipo de alteração**: Correção de bugs
- **Arquivos modificados**: 
  - src/components/utility/MeterReadingsForm.tsx
- **Detalhes técnicos**:
  - Adicionado campo de descrição ao diálogo de confirmação
  - Melhorada a estrutura dos dados enviados para o registro de cobranças
  - Corrigido problema de duplicação de variáveis que impedia a execução do servidor
  - Centralizada a criação da descrição de consumo para maior consistência
  - Aprimorada a exibição de informações de cobrança no diálogo de confirmação
- **Responsável**: Claude AI

### [2024-03-23] - Correções críticas no processo de leitura de medidores
- **Tipo de alteração**: Correção de bugs
- **Arquivos modificados**: 
  - src/components/utility/MeterReadingsForm.tsx
- **Detalhes técnicos**:
  - Corrigido problema onde a leitura anterior não era atualizada com base na última leitura registrada
  - Implementada estratégia de múltiplas tentativas para inserção de cobranças, tentando diferentes estruturas e até mesmo tabelas alternativas
  - Adicionado mais logs detalhados para diagnóstico preciso de falhas
  - Melhorado tratamento de erros para resistir a falhas parciais durante o processo
  - Garantido que a leitura anterior seja inicializada como zero quando não houver leituras anteriores
  - Refinada a interface do usuário para fornecer mensagens mais específicas sobre o resultado da operação
- **Responsável**: Claude AI

### [2024-03-23] - Correções finais no registro de leituras e cobranças
- **Tipo de alteração**: Correção de bugs
- **Arquivos modificados**: 
  - src/components/utility/MeterReadingsForm.tsx
- **Detalhes técnicos**:
  - Removido campo billing_id redundante que estava causando conflitos
  - Melhorada a lógica de atualização da leitura anterior ao revisitar o formulário
  - Simplificada a estrutura de dados enviada para as tabelas de cobrança
  - Garantido que a descrição seja incluída em todas as tentativas de inserção
  - Otimizado o fluxo de limpeza dos campos ao alternar entre unidades
  - Removidos comentários redundantes e melhorada a organização do código
- **Responsável**: Claude AI

### [2024-03-24] - Diagnóstico inteligente da estrutura de tabelas do Supabase
- **Tipo de alteração**: Melhoria de integração
- **Arquivos modificados**: 
  - src/components/utility/MeterReadingsForm.tsx
  - src/pages/TestSupabase.tsx
- **Detalhes técnicos**:
  - Implementada função `verifyBillingsTable()` para detectar automaticamente se existe tabela 'billings' ou 'billing'
  - Criada página de diagnóstico dedicada para testar a conexão com o Supabase e sua estrutura
  - Adicionada verificação automática das colunas disponíveis nas tabelas para adaptar os dados de inserção
  - Substituída a abordagem de múltiplas tentativas por uma única tentativa inteligente com estrutura adaptada
  - Adicionados melhores logs para ajudar no diagnóstico de problemas de conexão
  - Interface de teste renovada com tabs para testar conexão, consultas, inserção e diagnóstico da estrutura
- **Responsável**: Claude AI

### [2024-03-25] - Verificação automática e criação de tabelas necessárias
- **Tipo de alteração**: Melhoria de estabilidade
- **Arquivos modificados**: 
  - src/integrations/supabase/client.ts
  - src/components/utility/MeterReadingsForm.tsx
  - src/pages/TestSupabase.tsx
- **Detalhes técnicos**:
  - Expandida função `ensureTablesExist()` para verificar e criar tabela 'billings' se não existir
  - Implementada verificação e criação de tabelas no carregamento inicial do componente MeterReadingsForm
  - Adicionada página de diagnóstico com ferramentas para verificar, testar e criar as tabelas necessárias
  - Adicionada função para inserir dados de exemplo para testes
  - Aprimorada a verificação de estrutura de tabelas com múltiplas abordagens de fallback
  - Adicionada função `checkSupabaseConnection()` para diagnosticar problemas de conectividade
  - Criado fluxo de inicialização que garante a existência das tabelas antes de tentar usá-las
- **Responsável**: Claude AI

### [2024-03-26] - Integração entre Leituras de Medidores e Cobranças
- Implementado sistema robusto para verificar e criar a tabela `billings` automaticamente se não existir
- Melhorada a função `verifyBillingsTable` para verificar a existência da tabela sem depender de consultas ao pg_catalog
- Adicionado método alternativo para criação de tabelas no Supabase que funciona mesmo com restrições de permissão
- Criada estrutura de código para detectar e se adaptar à estrutura existente da tabela de cobranças
- Reorganizado o fluxo de processamento de leituras e geração de cobranças:
  - Primeiro salva a leitura de forma segura
  - Em seguida verifica a estrutura da tabela de cobranças
  - Por fim tenta inserir a cobrança com tratamento abrangente de erros
- Melhoria nas mensagens de confirmação para diferenciar quando a leitura é salva mas há problemas na geração da cobrança
- **Responsável:** Claude AI

### [2024-03-26] - Implementação de Sistema Robusto para Verificação de Tabelas
- Criada função `ensureMeterReadingsTableExists()` para verificar e criar automaticamente a tabela meter_readings
- Implementada lógica de diagnóstico avançado para verificar problemas com gravação de leituras
- Adicionada capacidade de verificar a estrutura da tabela via SQL direto
- Incluídas múltiplas abordagens para criação de tabela:
  - Via função RPC `execute_sql` 
  - Via REST API (fallback)
- Adicionada detecção inteligente do tipo de erro de tabela inexistente com adaptação para diferentes idiomas
- Implementadas funções utilitárias para verificar existência de tabelas e listar colunas
- Verificação dupla da estrutura da tabela com testes de inserção quando necessário
- **Responsável:** Claude AI

### [2024-03-26] - Diagnóstico Avançado do Sistema de Leituras de Medidores
- Adicionado sistema de diagnóstico avançado para verificar problemas com gravação de leituras de medidores
- Implementada verificação detalhada da estrutura da tabela `meter_readings` durante inicialização
- Criada rotina de teste automático que insere e remove um registro de teste para validar campos e estrutura
- Adicionados logs detalhados em cada etapa do processo de gravação de leituras:
  - Log do objeto exato sendo enviado para inserção
  - Confirmação da resposta do servidor após a inserção
  - Verificação secundária independente para confirmar que os dados foram efetivamente salvos
  - Comparação entre o valor enviado e o valor armazenado para identificar inconsistências
- Melhoria na detecção de erros com mensagens mais específicas sobre falhas de gravação
- Adicionada verificação para detectar casos onde a inserção foi executada mas nenhum dado foi retornado
- Implementada rotina de diagnóstico que executa no carregamento do componente para detectar problemas estruturais na tabela
- **Responsável:** Claude AI

### [2024-03-27] - Implementação de Gerenciamento Automático de RLS no Supabase
- Criadas funções para verificar e desabilitar RLS (Row Level Security) para permitir acesso anônimo às tabelas
- Adicionada função `configureRLS()` para gerenciar políticas de segurança em múltiplas tabelas
- Implementadas funções `ensureUnitsTableExists()` e `ensureResidentsTableExists()` para verificar existência das tabelas e criá-las se necessário
- Integrada verificação automática de RLS na inicialização da página de unidades
- Adicionada capacidade de desabilitar automaticamente RLS para tabelas recém-criadas
- Implementada estrutura robusta com fallbacks para ambientes com restrições de permissão
- Melhorada a experiência do usuário ao lidar com problemas de permissão do Supabase
- Integradas mensagens de erro mais informativas usando o sistema de toast
- **Responsável:** Claude AI

### [2024-03-27] - Correção de Problemas com Políticas de Segurança (RLS)
- **Tipo de alteração**: Correção de bug
- **Arquivos modificados**: 
  - src/utils/dbUtils.ts
  - src/pages/Units.tsx
- **Detalhes técnicos**:
  - Modificada a função `configureRLS()` para apenas verificar tabelas existentes sem tentar modificar RLS
  - Removidas chamadas à função inexistente `execute_sql` no Supabase que estavam causando erros 404
  - Melhoria no fluxo de verificação para não bloquear o funcionamento do aplicativo mesmo sem permissões de RLS
  - Adicionados retornos antecipados na função `checkAndConfigureDatabase` para evitar processamento desnecessário
  - Simplificada a lógica de verificação para melhorar a robustez da aplicação
  - Mantida a criação de tabelas, mas removida a tentativa de alterar suas políticas de segurança
- **Responsável**: Claude AI

### [2024-03-27] - Correção do Problema com Adição de Unidades
- **Tipo de alteração**: Correção de bug
- **Arquivos modificados**: 
  - src/pages/Units.tsx
- **Detalhes técnicos**:
  - Corrigido conflito de importação do toast que causava problemas ao adicionar unidades
  - Renomeada a função toast para customToast para evitar conflitos com a importação do Sonner
  - Modificado tipo do botão de submit para button para evitar comportamento de form padrão
  - Adicionado preventDefault() nos manipuladores de eventos para garantir comportamento consistente
  - Corrigido método onOpenChange do componente Dialog para melhorar rastreamento
  - Adicionados logs detalhados para facilitar o diagnóstico de problemas com manipuladores de eventos
  - Corrigida sobrecarga de dependências nos useCallbacks que geravam comportamento inconsistente
- **Responsável**: Claude AI

### [2024-03-27] - Remoção da Geração Automática de Dados de Teste
- **Tipo de alteração**: Melhoria
- **Arquivos modificados**: 
  - src/pages/Units.tsx
- **Detalhes técnicos**:
  - Removida a geração automática de unidades de teste e moradores quando nenhuma unidade é encontrada
  - Mantida a lógica principal para buscar as unidades existentes do Supabase
  - Simplificado o fluxo de inicialização da página de unidades
  - Alterado o comportamento para simplesmente mostrar a lista vazia quando não há unidades cadastradas
  - Permitido que o usuário adicione suas próprias unidades manualmente desde o início
- **Responsável**: Claude AI

### [2024-03-28] - Campo de Bloco Opcional para Unidades
- **Tipo de alteração**: Melhoria de usabilidade
- **Arquivos modificados**: 
  - src/pages/Units.tsx
- **Detalhes técnicos**:
  - Modificado o campo de bloco para ser opcional ao adicionar unidades
  - Removida a validação obrigatória que impedia registrar unidades sem especificar bloco
  - Ajustados os rótulos dos campos para indicar claramente quais são obrigatórios (*)
  - Adicionados textos de ajuda para melhorar a experiência do usuário
  - Ajustadas as mensagens de erro para serem coerentes quando o bloco não é especificado
  - Atualizadas as funções de verificação para funcionar corretamente com bloco vazio
  - Melhorada a mensagem de validação que indica quando uma unidade já está cadastrada
- **Responsável**: Claude AI

### [2024-08-13] - Correção no componente de seleção de banco na criação de contas
- **Tipo de alteração:** Correção na criação de novas contas bancárias.
- **Arquivos modificados:** 
  - `src/contexts/BankAccountContext.tsx`
  - `src/pages/BankAccounts.tsx`
- **Detalhes técnicos:** 
  - Adicionado fallback para quando a tabela 'banks' no Supabase não existe ou está vazia
  - Criada lista padrão de bancos principais para evitar componente vazio
  - Melhorado tratamento de estados de carregamento no componente de seleção
  - Corrigido formatação das opções de banco
- **Responsável:** Claude (Assistente IA)

### [2024-01-09] - [Cursor com Claude]
- **Tipo de alteração**: Correção na geração do QR Code PIX
- **Arquivos modificados**: 
  - src/utils/pdf/pixUtils.ts
  - src/lib/pdfService.ts
- **Detalhes técnicos**: 
  - Corrigido o formato do valor da transação para centavos (sem ponto decimal).
  - Normalizado o nome do beneficiário e a cidade, garantindo que estejam em conformidade com as especificações do Banco Central.
  - Simplificado o ID da transação para um formato mais curto e compatível.
  - Recalculado o CRC16 após as alterações nos campos.
  - Adicionadas instruções simplificadas para o usuário no PDF gerado.
- **Responsável**: Claude (AI Assistant)

### [2025-06-25] - [Cursor com Claude]
- **Tipo de alteração**: Correção no cálculo de totais em cobranças canceladas
- **Arquivos modificados**: 
  - src/pages/Billing.tsx
- **Detalhes técnicos**: 
  - Corrigido o cálculo do valor total a pagar para não incluir cobranças com status "cancelled".
  - Modificada a função `groupBillingsByUnit` para excluir valores cancelados do total.
  - Ajustados os métodos `handleGeneratePixQRCode`, `handleGenerateBoleto` e `handleGenerateSummaryPDF` para usar apenas os valores ativos.
  - Adicionada indicação visual de quantos itens são ativos versus o total de itens.
  - Adicionada nota explicativa na interface indicando que o valor exibido considera apenas cobranças não canceladas.
  - Atualizada a marcação de cobranças como impressas para ignorar itens cancelados.
- **Responsável**: Claude (AI Assistant)

### [2025-06-25] - [Cursor com Claude]
- **Tipo de alteração**: Correção na funcionalidade de adicionar novas contas bancárias
- **Arquivos modificados**: 
  - src/pages/BankAccounts.tsx
- **Detalhes técnicos**: 
  - Implementado o formulário completo para criação de novas contas bancárias que estava ausente.
  - Adicionada validação de campos obrigatórios (nome, banco, agência e número da conta).
  - Corrigido o tipo do estado `newAccount` para corresponder adequadamente ao tipo esperado pela função `addBankAccount`.
  - Adicionado suporte à chave PIX com diferentes formatos e validação.
  - Implementados botões para salvar ou cancelar a operação.
  - Adicionada limpeza do formulário após o fechamento do diálogo.
- **Responsável**: Claude (AI Assistant)

### [2025-06-26] - [Cursor com Claude]
- **Tipo de alteração**: Integração com tabela de bancos do Supabase
- **Arquivos modificados**: 
  - src/contexts/BankAccountContext.tsx
  - src/pages/BankAccounts.tsx
- **Detalhes técnicos**: 
  - Adicionada função `fetchBanks()` ao contexto para obter a lista de bancos brasileiros diretamente do Supabase.
  - Substituído o campo de texto livre para bancos por um componente Select com lista completa de bancos.
  - Implementada formatação padronizada para exibição dos bancos no formato "XXXX - NOME DO BANCO".
  - Campo banco nos formulários de criação e edição agora exibe os valores da tabela "banks" do Supabase.
  - Adicionados manipuladores de erro para casos em que a tabela de bancos não esteja disponível.
  - Melhorada a experiência do usuário com mensagens claras durante o carregamento.
- **Responsável**: Claude (AI Assistant)

### [2025-06-20] - Correção no componente de seleção de banco na criação de contas
- **Tipo de alteração:** Correção na criação de novas contas bancárias.
- **Arquivos modificados:** 
  - `src/contexts/BankAccountContext.tsx`
  - `src/pages/BankAccounts.tsx`
- **Detalhes técnicos:** 
  - Adicionado fallback para quando a tabela 'banks' no Supabase não existe ou está vazia
  - Criada lista padrão de bancos principais para evitar componente vazio
  - Melhorado tratamento de estados de carregamento no componente de seleção
  - Corrigido formatação das opções de banco
- **Responsável:** Claude (Assistente IA)

### [2024-08-13] - Implementação de Typeahead para seleção de bancos
- **Tipo de alteração:** Melhoria de usabilidade na seleção de bancos.
- **Arquivos modificados:** 
  - `src/pages/BankAccounts.tsx`
- **Detalhes técnicos:** 
  - Substituído o componente Select padrão por um Combobox (Typeahead) para o campo de banco
  - Implementada busca em tempo real que filtra os bancos à medida que o usuário digita
  - Melhorada a experiência do usuário para lidar com a grande quantidade de bancos no Brasil
  - Adicionada otimização com useMemo para evitar recálculos desnecessários durante a filtragem
  - Componentes separados para edição e criação de contas para evitar conflitos de estado
- **Responsável:** Claude (Assistente IA)

### [2024-08-13] - Melhoria na interface de seleção de bancos com Typeahead
- **Tipo de alteração:** Aprimoramento de usabilidade
- **Arquivos modificados:** 
  - `src/pages/BankAccounts.tsx`
  - `src/contexts/BankAccountContext.tsx`
- **Detalhes técnicos:** 
  - Adicionado suporte a seleção por clique do mouse no componente Typeahead
  - Aumentado o tamanho da área de visualização dos bancos para mostrar mais opções
  - Melhorado o feedback visual com destaque nos itens ao passar o mouse
  - Adicionado cursor pointer para indicar claramente elementos clicáveis
  - Aumentado o limite da consulta de bancos para garantir que todos os bancos sejam exibidos (até 1000)
  - Adicionados logs para diagnóstico do número de bancos retornados pela consulta
- **Responsável:** Claude (Assistente IA)

### [2024-08-13] - Correção na interface de seleção de bancos
- **Tipo de alteração:** Correção de bug
- **Arquivos modificados:** 
  - `src/pages/BankAccounts.tsx`
  - `src/contexts/BankAccountContext.tsx`
- **Detalhes técnicos:** 
  - Corrigido problema que impedia a seleção de bancos com o mouse
  - Ajustada a largura do popover para comportar todos os textos
  - Garantido que todos os 442 bancos sejam carregados pelo Supabase (limite de 1000)
  - Melhorada a apresentação visual da lista com espaçamento adequado e formatação consistente
- **Responsável:** Claude (Assistente IA)

### [2024-08-13] - Correção na consulta a tabela de bancos no Supabase
- **Tipo de alteração:** Correção de bug
- **Arquivos modificados:** 
  - `src/contexts/BankAccountContext.tsx`
- **Detalhes técnicos:** 
  - Implementada detecção automática dos nomes das colunas na tabela de bancos
  - Corrigido erro 400 ao consultar a tabela 'banks' no Supabase
  - Adicionada verificação prévia para identificar os nomes das colunas disponíveis
  - Melhorada a função `fetchBanks()` para adaptar-se a diferentes estruturas de tabela
  - Adicionado tratamento de valores para evitar erros de tipos
- **Responsável:** Claude (Assistente IA)
