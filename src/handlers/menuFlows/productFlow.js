// src/handlers/menuFlows/productFlow.js
const { messages } = require("../../config/messages");
const { CHAT_STATES } = require("../../config/constants");
const { validateText } = require("../utils/validation");
const statsService = require("../../services/statisticsService");

/**
 * Gerencia o fluxo de disponibilidade de produtos
 */
class ProductFlow {
  /**
   * Inicia o fluxo de disponibilidade de produtos
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {Object} chatInfo - Informações do chat
   */
  static async start(message, chat, chatInfo) {
    await chat.sendStateTyping();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await message.reply(messages.option_2);
    chatInfo.state = CHAT_STATES.OPTION_SELECTED;

    // Registrar que o usuário escolheu esta opção
    statsService.incrementOptionCount("2");

    return chatInfo;
  }

  /**
   * Processa informações de disponibilidade de produtos
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {string} messageContent - Conteúdo da mensagem
   * @param {Object} chatInfo - Informações do chat
   */
  static async handleProductAvailability(
    message,
    chat,
    messageContent,
    chatInfo
  ) {
    const productInfo = messageContent.trim();

    if (validateText(productInfo, 2)) {
      // Nome do produto válido, salvar
      chatInfo.data.productInfo = productInfo;
      chatInfo.invalidAttempts = 0;

      // O fluxo termina aqui, retornar para transferir para atendente
      return chatInfo;
    } else {
      await message.reply(
        "Por favor, forneça mais detalhes sobre o produto que deseja verificar a disponibilidade."
      );
      chatInfo.invalidAttempts++;
      return chatInfo;
    }
  }
}

module.exports = ProductFlow;
