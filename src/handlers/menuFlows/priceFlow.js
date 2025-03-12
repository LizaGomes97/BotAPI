// src/handlers/menuFlows/priceFlow.js
const { messages } = require("../../config/messages");
const { CHAT_STATES, YES_NO_OPTIONS } = require("../../config/constants");
const {
  validateCPF,
  validateDate,
  validateOption,
} = require("../utils/validation");
const statsService = require("../../services/statisticsService");

/**
 * Gerencia o fluxo de consulta de preços
 */
class PriceFlow {
  /**
   * Inicia o fluxo de consulta de preços
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {Object} chatInfo - Informações do chat
   */
  static async start(message, chat, chatInfo) {
    await chat.sendStateTyping();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await message.reply(messages.option_1.initial);
    chatInfo.state = CHAT_STATES.PRICE_CHECK_ASK_IF_CLIENT;

    // Registrar que o usuário escolheu esta opção
    statsService.incrementOptionCount("1");

    return chatInfo;
  }

  /**
   * Processa resposta sobre se é cliente ou não
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {string} messageContent - Conteúdo da mensagem
   * @param {Object} chatInfo - Informações do chat
   */
  static async handleIsClientResponse(message, chat, messageContent, chatInfo) {
    const response = messageContent.trim();

    if (response === YES_NO_OPTIONS.YES) {
      // É cliente
      await chat.sendStateTyping();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await message.reply(messages.option_1.is_client);
      chatInfo.state = CHAT_STATES.PRICE_CHECK_IS_CLIENT;
      chatInfo.data.isClient = true;
      chatInfo.invalidAttempts = 0; // Resetar tentativas inválidas
    } else if (response === YES_NO_OPTIONS.NO) {
      // Não é cliente
      await chat.sendStateTyping();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await message.reply(messages.option_1.not_client.initial);
      chatInfo.state = CHAT_STATES.PRICE_CHECK_NOT_CLIENT;
      chatInfo.data.isClient = false;
      chatInfo.invalidAttempts = 0; // Resetar tentativas inválidas
    } else {
      await message.reply(messages.option_1.invalid_option);
      chatInfo.invalidAttempts++; // Incrementar tentativas inválidas
    }

    return chatInfo;
  }

  /**
   * Processa CPF do cliente
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {string} messageContent - Conteúdo da mensagem
   * @param {Object} chatInfo - Informações do chat
   */
  static async handleClientCPF(message, chat, messageContent, chatInfo) {
    const cpf = messageContent.trim();

    if (validateCPF(cpf)) {
      // CPF válido, salvar
      chatInfo.data.cpf = cpf;

      // Perguntar sobre medicamento
      await chat.sendStateTyping();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await message.reply(
        "Obrigado! Qual medicamento ou produto você deseja consultar?"
      );

      // Próximo estado
      chatInfo.state = CHAT_STATES.PRICE_CHECK_NO_ACCOUNT;
      chatInfo.invalidAttempts = 0; // Resetar tentativas inválidas
    } else {
      await message.reply(
        "❌ CPF inválido. Por favor, digite um CPF válido no formato 123.456.789-00 ou apenas números."
      );
      chatInfo.invalidAttempts++; // Incrementar tentativas inválidas
    }

    return chatInfo;
  }

  /**
   * Processa escolha de não-cliente (criar conta ou não)
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {string} messageContent - Conteúdo da mensagem
   * @param {Object} chatInfo - Informações do chat
   */
  static async handleNonClientChoice(message, chat, messageContent, chatInfo) {
    const response = messageContent.trim();

    if (response === YES_NO_OPTIONS.YES) {
      // Quer criar conta - Agora vamos solicitar CPF primeiro
      await chat.sendStateTyping();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await message.reply(messages.option_1.not_client.create_account_cpf);
      chatInfo.state = CHAT_STATES.PRICE_CHECK_CREATE_ACCOUNT_CPF;
      chatInfo.data.willCreateAccount = true;
      chatInfo.invalidAttempts = 0; // Resetar tentativas inválidas
    } else if (response === YES_NO_OPTIONS.NO) {
      // Não quer criar conta
      await chat.sendStateTyping();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await message.reply(messages.option_1.not_client.no_account);
      chatInfo.state = CHAT_STATES.PRICE_CHECK_NO_ACCOUNT;
      chatInfo.data.willCreateAccount = false;
      chatInfo.invalidAttempts = 0; // Resetar tentativas inválidas
    } else {
      await message.reply(messages.option_1.not_client.invalid_option);
      chatInfo.invalidAttempts++; // Incrementar tentativas inválidas
    }

    return chatInfo;
  }

  /**
   * Processa CPF para criação de conta
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {string} messageContent - Conteúdo da mensagem
   * @param {Object} chatInfo - Informações do chat
   */
  static async handleCreateAccountCPF(message, chat, messageContent, chatInfo) {
    const cpf = messageContent.trim();

    if (validateCPF(cpf)) {
      // CPF válido, salvar e pedir data de nascimento
      chatInfo.data.cpf = cpf;

      await chat.sendStateTyping();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await message.reply(
        messages.option_1.not_client.create_account_birthdate
      );

      // Próximo estado
      chatInfo.state = CHAT_STATES.PRICE_CHECK_CREATE_ACCOUNT_BIRTHDATE;
      chatInfo.invalidAttempts = 0; // Resetar tentativas inválidas
    } else {
      await message.reply(
        "❌ CPF inválido. Por favor, digite um CPF válido no formato 123.456.789-00 ou apenas números."
      );
      chatInfo.invalidAttempts++; // Incrementar tentativas inválidas
    }

    return chatInfo;
  }

  /**
   * Processa data de nascimento para criação de conta
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {string} messageContent - Conteúdo da mensagem
   * @param {Object} chatInfo - Informações do chat
   */
  static async handleBirthdate(message, chat, messageContent, chatInfo) {
    const birthdate = messageContent.trim();

    if (validateDate(birthdate)) {
      // Data válida, salvar
      chatInfo.data.birthdate = birthdate;

      // Perguntar sobre medicamento
      await chat.sendStateTyping();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await message.reply(
        "Obrigado pelo seu cadastro! Qual medicamento ou produto você deseja consultar?"
      );

      // Próximo estado
      chatInfo.state = CHAT_STATES.PRICE_CHECK_NO_ACCOUNT;
      chatInfo.invalidAttempts = 0; // Resetar tentativas inválidas
    } else {
      await message.reply(
        "❌ Data inválida. Por favor, digite uma data válida no formato DD/MM/AAAA."
      );
      chatInfo.invalidAttempts++; // Incrementar tentativas inválidas
    }

    return chatInfo;
  }

  /**
   * Processa nome do produto e transfere para atendente
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {string} messageContent - Conteúdo da mensagem
   * @param {Object} chatInfo - Informações do chat
   */
  static async handleProductName(message, chat, messageContent, chatInfo) {
    // Salvar nome do produto
    chatInfo.data.productName = messageContent.trim();

    // O fluxo termina aqui, retornar para transferir para atendente
    return chatInfo;
  }
}

module.exports = PriceFlow;
