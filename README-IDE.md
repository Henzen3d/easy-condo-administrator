# Documentação Estruturada para Integração com IDEs

Este documento fornece orientações sobre como utilizar o arquivo de configuração `condogest-ide-config.json` para integração com IDEs e ferramentas de desenvolvimento.

## Estrutura do Arquivo JSON

O arquivo de configuração está organizado em 5 seções principais:

```json
{
  "project": {},       // Metadados do projeto
  "structure": {},     // Estrutura de componentes e arquivos
  "style": {},         // Configurações de estilo
  "extensions": {},    // Pontos de extensão
  "examples": {}       // Exemplos de uso
}
```

### 1. Metadados do Projeto (`project`)
Contém informações gerais sobre o projeto:
- Nome
- Versão
- Descrição
- Tecnologias utilizadas

### 2. Estrutura de Componentes (`structure`)
Mapeamento da arquitetura do projeto:
- Componentes de layout
- Componentes UI básicos e complexos
- Hooks customizados
- Contextos de aplicação

### 3. Configurações de Estilo (`style`)
Padrões visuais do sistema:
- Paleta de cores
- Tipografia
- Escala de tamanhos

### 4. Pontos de Extensão (`extensions`)
Áreas customizáveis do sistema:
- Componentes customizáveis
- Endpoints da API
- Hooks reutilizáveis

### 5. Exemplos de Uso (`examples`)
Códigos de exemplo para:
- Uso de componentes
- Chamadas à API
- Configuração de temas

## Como Utilizar

1. Importe o arquivo JSON em sua IDE
2. Utilize os metadados para configuração inicial
3. Consulte a estrutura de componentes para navegação
4. Utilize os exemplos para implementação rápida

## Boas Práticas

- Mantenha o arquivo atualizado com as mudanças no projeto
- Utilize os pontos de extensão para customizações
- Siga os padrões de estilo definidos
- Consulte os exemplos antes de implementar novas funcionalidades

## Registro de Mudanças

Todas as alterações feitas por IDEs com suporte a IA são registradas no arquivo [change-log.md](./change-log.md). Este arquivo segue um padrão estruturado para facilitar o acompanhamento das modificações.

### Como Registrar Mudanças

1. Ao fazer alterações significativas, adicione uma nova entrada no log
2. Siga o formato padrão descrito no arquivo
3. Inclua detalhes técnicos relevantes
4. Identifique a ferramenta/IA responsável

## Suporte

Para dúvidas ou sugestões, abra uma issue no repositório do projeto.