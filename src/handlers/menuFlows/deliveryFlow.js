// src/handlers/menuFlows/deliveryFlow.js
const { messages } = require("../../config/messages");
const { CHAT_STATES, YES_NO_OPTIONS } = require("../../config/constants");
const { validateOption } = require("../utils/validation");
const statsService = require("../../services/statisticsService");

/**
 * Gerencia o fluxo de informações de entrega
 */
class DeliveryFlow {
  /**
   * Inicia o fluxo de informações de entrega
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {Object} chatInfo - Informações do chat
   */
  static async start(message, chat, chatInfo) {
    await chat.sendStateTyping();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await message.reply(messages.option_3.initial);
    chatInfo.state = CHAT_STATES.DELIVERY_CONFIRMATION;

    // Registrar que o usuário escolheu esta opção
    statsService.incrementOptionCount("3");

    return chatInfo;
  }

  /**
   * Processa confirmação de entrega
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {string} messageContent - Conteúdo da mensagem
   * @param {Object} chatInfo - Informações do chat
   */
  static async handleDeliveryConfirmation(
    message,
    chat,
    messageContent,
    chatInfo
  ) {
    const response = messageContent.trim();

    if (response === YES_NO_OPTIONS.YES) {
      // Quer prosseguir com a entrega
      await chat.sendStateTyping();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await message.reply(messages.option_3.go_entrega);
      chatInfo.state = CHAT_STATES.DELIVERY_PRODUCTS;
      chatInfo.data.proceedWithDelivery = true;
      chatInfo.invalidAttempts = 0; // Resetar tentativas inválidas
    } else if (response === YES_NO_OPTIONS.NO) {
      // Não quer prosseguir
      await chat.sendStateTyping();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await message.reply(messages.option_3.disistir_entrega.initial);
      chatInfo.state = CHAT_STATES.DELIVERY_DECLINED;
      chatInfo.data.proceedWithDelivery = false;
      chatInfo.invalidAttempts = 0; // Resetar tentativas inválidas
    } else {
      await message.reply(messages.option_3.invalid_option);
      chatInfo.invalidAttempts++; // Incrementar tentativas inválidas
    }

    return chatInfo;
  }

  /**
   * Processa lista de produtos para entrega
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {string} messageContent - Conteúdo da mensagem
   * @param {Object} chatInfo - Informações do chat
   */
  static async handleDeliveryProducts(message, chat, messageContent, chatInfo) {
    // Salvar lista de produtos
    chatInfo.data.deliveryProducts = messageContent.trim();

    // O fluxo termina aqui, retornar para transferir para atendente
    return chatInfo;
  }

  /**
   * Processa resposta após declinar entrega
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {string} messageContent - Conteúdo da mensagem
   * @param {Object} chatInfo - Informações do chat
   */
  static async handleDeliveryDeclined(message, chat, messageContent, chatInfo) {
    const response = messageContent.trim();

    if (response === YES_NO_OPTIONS.YES) {
      // Voltar para o menu principal
      await chat.sendStateTyping();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await message.reply(messages.menu_options);
      chatInfo.state = CHAT_STATES.MENU_SHOWN;
      chatInfo.option = null;
      chatInfo.invalidAttempts = 0; // Resetar tentativas inválidas
    } else if (response === YES_NO_OPTIONS.NO) {
      // Falar com atendente
      await chat.sendStateTyping();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await message.reply(messages.option_4);
      chatInfo.state = CHAT_STATES.OPTION_SELECTED;
      chatInfo.option = "4";
      chatInfo.invalidAttempts = 0; // Resetar tentativas inválidas

      // Registrar que o usuário escolheu falar com atendente
      statsService.incrementOptionCount("4");
    } else {
      await message.reply(messages.option_3.disistir_entrega.invalid_option);
      chatInfo.invalidAttempts++; // Incrementar tentativas inválidas
    }

    return chatInfo;
  }
}

module.exports = DeliveryFlow;
