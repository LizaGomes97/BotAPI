// src/config/messages.js

const messages = {
  // Mensagens iniciais
  welcome:
    "👋 *Olá! Bem-vindo à Drogasil.*\n\n" +
    "Eu sou o assistente virtual da Drogasil e estou aqui para ajudar com suas dúvidas.",

  menu_options:
    "🔍 *Como posso ajudar hoje?*\n\n" +
    "Digite o número da opção desejada:\n\n" +
    "1️⃣ - Consulta de preços\n" +
    "2️⃣ - Disponibilidade de produtos\n" +
    "3️⃣ - Informações de entrega\n" +
    "4️⃣ - Falar com um atendente",

  invalid_option:
    "❌ Opção inválida. Por favor, digite um número de 1 a 4 para selecionar uma opção do menu.",

  // Opção 1: Consulta de Preços - fluxo expandido
  option_1: {
    initial:
      "💊 *Consulta de Preços*\n\n" +
      "Você já é cliente Drogasil?\n\n" +
      "1️⃣ - Sim\n" +
      "2️⃣ - Não",

    invalid_option:
      "❌ Opção inválida. Por favor, digite 1 para Sim ou 2 para Não.",

    is_client:
      "✅ *Para clientes*\n\n" +
      "Por favor, me informe o número de seu CPF para que eu possa consultar seus dados.",

    not_client: {
      initial:
        "👤 *Para não clientes*\n\n" +
        "Gostaria de realizar seu cadastro para melhores ofertas?\n\n" +
        "1️⃣ - Sim\n" +
        "2️⃣ - Não",

      invalid_option:
        "❌ Opção inválida. Por favor, digite 1 para Sim ou 2 para Não.",

      create_account_cpf:
        "📝 *Criar cadastro*\n\n" +
        "Certo, preciso de dois dados para realizar seu cadastro: seu CPF e sua data de nascimento.\n\n" +
        "Primeiro, me informe seu CPF com 11 dígitos (xxx.xxx.xxx-xx):",

      create_account_birthdate:
        "✅ CPF recebido! Agora me informe sua data de nascimento no formato DD/MM/AAAA:",

      no_account:
        "👌 *Seguir sem cadastro*\n\n" +
        "Certinho, qual o medicamento ou produto que deseja consultar?",
    },
  },

  // Opção 2: Disponibilidade de Produtos
  option_2:
    "🔍 *Disponibilidade de Produtos*\n\n" +
    "Para verificar a disponibilidade, por favor, informe o nome do produto.",

  // Opção 3: Informações de Entrega
  option_3: {
    initial:
      "🚚 *Informações de Entrega*\n\n" +
      "Entregamos para toda Guanambi-BA mediante a taxa de R$ 7,00\n\n" +
      "Gostaria de prosseguir com a solicitação?\n\n" +
      "1️⃣ - Sim\n" +
      "2️⃣ - Não",

    invalid_option:
      "❌ Opção inválida. Por favor, digite 1 para Sim ou 2 para Não.",

    go_entrega:
      "✅ *Solicitar Entrega*\n\n" +
      "Por favor, me informe os produtos que deseja para a entrega",

    disistir_entrega: {
      initial:
        "👤 *Desistir da Entrega*\n\n" +
        "Gostaria de voltar para o menu principal?\n\n" +
        "1️⃣ - Sim\n" +
        "2️⃣ - Falar com um atendente\n",

      invalid_option:
        "❌ Opção inválida. Por favor, digite 1 para Sim ou 2 para falar com um atendente.",
    },
  },

  // Opção 4: Falar com atendente
  option_4:
    "👨‍💼 *Falar com um atendente*\n\n" +
    "Claro! Vou transferir você para um de nossos atendentes especializados. Qual o assunto que você gostaria de tratar?",

  // Mensagem de transferência
  transferring_to_agent:
    "👨‍💼 Obrigado pelas informações! Para melhor atendê-lo, vou transferir sua solicitação para um de nossos atendentes especializados.\n\n" +
    "Um atendente humano assumirá esta conversa em breve. Tenha uma ótima experiência!",
};

module.exports = {
  messages,
};
