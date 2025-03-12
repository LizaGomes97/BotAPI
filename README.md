# Bot WhatsApp Drogasil

Bot de WhatsApp para atendimento automatizado a clientes da Drogasil, com suporte a transferência para atendentes humanos e fluxo detalhado para consultas diversas.

## Características

- Conexão com WhatsApp Web via QR Code
- Persistência de sessão para evitar re-autenticação
- Respostas automáticas baseadas em menu de opções
- Fluxos detalhados para todas as opções do menu
- Sistema de transferência para atendimento humano
- Validação de dados (CPF, datas)
- Ignorar grupos automaticamente
- Relatórios de atendimento
- Marcação de mensagens como não lidas para facilitar triagem

## Melhorias Implementadas

1. **Ignorar Mensagens em Grupos**

   - O bot ignora automaticamente mensagens de grupos
   - Evita comportamento indesejado em grupos de WhatsApp

2. **Tratamento de Opções Inválidas**

   - O bot rastreia tentativas inválidas do usuário
   - Após 3 tentativas falhas, reinicia a conversa automaticamente
   - Validação de CPF e datas para evitar dados incorretos

3. **Estabilidade em Segundo Plano**

   - Configurações avançadas do Puppeteer para executar em segundo plano
   - Persistência de sessão para evitar escanear QR code a cada inicialização
   - Reconexão automática em caso de desconexão
   - Tratamento de exceções não capturadas

4. **Relatórios de Atendimento**
   - Estatísticas em tempo real: clientes ativos, na fila, etc.
   - Relatórios periódicos a cada hora
   - Marcação de mensagens como não lidas para facilitar a triagem pelos atendentes
   - Coleta de dados completa em cada etapa da conversa

## Estrutura do Projeto

```
whatsapp_bot_api/
├── session.json            # Arquivo de sessão persistente
├── last_qrcode.txt         # Último QR code gerado (para acesso remoto)
├── user_data/              # Dados de usuário do Puppeteer
├── src/
│   ├── config/
│   │   └── messages.js     # Mensagens pré-definidas
│   ├── handlers/
│   │   └── messageHandler.js # Lógica de tratamento de mensagens
│   └── index.js            # Código principal
└── package.json
```

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

## Execução

Para iniciar o bot:

```bash
npm start
```

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```

## Relatórios de Atendimento

O bot gera automaticamente relatórios de atendimento com as seguintes informações:

- Número total de conversas desde o início
- Conversas ativas no momento
- Clientes aguardando atendimento humano
- Clientes em atendimento humano
- Detalhes de cada cliente: estado, opção escolhida, tempo de espera, etc.

## Fluxo de Atendimento

### Menu Principal

1. **Boas-vindas**: Bot dá boas-vindas e apresenta o menu de opções
2. **Opções**:
   - 1️⃣ - Consulta de preços
   - 2️⃣ - Disponibilidade de produtos
   - 3️⃣ - Informações de entrega
   - 4️⃣ - Falar com um atendente

### Opção 1: Consulta de Preços

1. **Verificação de cliente**: Bot pergunta se usuário já é cliente Drogasil
   - **Se é cliente**: Bot solicita CPF (com validação)
   - **Se não é cliente**: Bot pergunta se deseja realizar cadastro
     - **Se deseja cadastro**: Bot solicita data de nascimento (com validação)
     - **Se não deseja cadastro**: Bot prossegue sem cadastro
2. **Consulta do produto**: Bot solicita nome do medicamento/produto
3. **Transferência**: Bot informa que transferirá para um atendente

### Opção 3: Informações de Entrega

1. **Informação de taxa**: Bot informa sobre a taxa de entrega para Guanambi-BA
2. **Confirmação**: Bot pergunta se cliente quer prosseguir com a solicitação
   - **Se sim**: Bot solicita lista de produtos para entrega
   - **Se não**: Bot pergunta se quer voltar ao menu ou falar com atendente

## Validação de Dados

O bot inclui validação para:

- **CPF**: Verifica formato e dígitos
- **Data de nascimento**: Verifica formato DD/MM/AAAA e validade da data

## Solução de Problemas

Se encontrar problemas na inicialização do bot:

1. Verifique se o WhatsApp no seu telefone está conectado à internet
2. Se o bot não conseguir reconectar automaticamente:
   - Delete os arquivos `session.json` e a pasta `user_data`
   - Reinicie o bot e escaneie o QR code novamente
3. Se o PC hibernar ou a tela travar, o bot tentará se manter conectado em segundo plano

## Próximos Passos

- Implementação de API para preços em tempo real
- Dashboard visual para monitoramento de atendimentos
- Sistema de filas avançado para atendentes

## Tecnologias Utilizadas

- Node.js
- whatsapp-web.js
- qrcode-terminal
- puppeteer (através do whatsapp-web.js)
