// src/handlers/menuFlows/agentFlow.js
const { messages } = require("../../config/messages");
const { CHAT_STATES } = require("../../config/constants");
const { validateText } = require("../utils/validation");
const statsService = require("../../services/statisticsService");

/**
 * Gerencia o fluxo para falar com atendente
 */
class AgentFlow {
  /**
   * Inicia o fluxo para falar com atendente
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {Object} chatInfo - Informações do chat
   */
  static async start(message, chat, chatInfo) {
    await chat.sendStateTyping();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await message.reply(messages.option_4);
    chatInfo.state = CHAT_STATES.OPTION_SELECTED;

    // Registrar que o usuário escolheu esta opção
    statsService.incrementOptionCount("4");

    return chatInfo;
  }

  /**
   * Processa assunto para falar com atendente
   * @param {Object} message - Mensagem do WhatsApp
   * @param {Object} chat - Chat do WhatsApp
   * @param {string} messageContent - Conteúdo da mensagem
   * @param {Object} chatInfo - Informações do chat
   */
  static async handleAgentSubject(message, chat, messageContent, chatInfo) {
    const subject = messageContent.trim();

    if (validateText(subject)) {
      // Assunto válido, salvar
      chatInfo.data.agentSubject = subject;
      chatInfo.invalidAttempts = 0;

      // O fluxo termina aqui, retornar para transferir para atendente
      return chatInfo;
    } else {
      await message.reply(
        "Por favor, descreva brevemente o assunto que gostaria de tratar com nosso atendente."
      );
      chatInfo.invalidAttempts++;
      return chatInfo;
    }
  }
}

module.exports = AgentFlow;
