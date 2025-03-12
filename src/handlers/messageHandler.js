// src/handlers/messageHandler.js
const { messages } = require("../config/messages");
const {
  CHAT_STATES,
  BOT_CONFIG,
  MENU_OPTIONS,
} = require("../config/constants");
const PriceFlow = require("./menuFlows/priceFlow");
const ProductFlow = require("./menuFlows/productFlow");
const DeliveryFlow = require("./menuFlows/deliveryFlow");
const AgentFlow = require("./menuFlows/agentFlow");
const statsService = require("../services/statisticsService");
const {
  generateAttendanceReport,
  printReport,
  saveReport,
} = require("./utils/reporting");

// Armazenar conversas ativas e estado de cada uma
const activeChats = new Map();

/**
 * Gerencia as mensagens recebidas
 * @param {Object} message - Objeto de mensagem do WhatsApp
 */
async function handleMessage(message) {
  try {
    // Ignorar mensagens do próprio bot
    if (message.fromMe) return;

    // Ignorar mensagens de grupos
    const chat = await message.getChat();
    if (chat.isGroup) {
      console.log(`Mensagem de grupo ignorada: ${chat.name}`);
      return;
    }

    const contactId = message.from;
    const messageContent = message.body.trim();

    // Obtém ou inicializa o estado da conversa
    if (!activeChats.has(contactId)) {
      activeChats.set(contactId, {
        state: CHAT_STATES.INITIAL,
        option: null,
        subOption: null,
        data: {},
        lastActivity: Date.now(),
        invalidAttempts: 0,
        conversationStart: Date.now(),
      });

      // Atualizar estatísticas para novo chat
      statsService.incrementTotalChats();
    }

    const chatInfo = activeChats.get(contactId);
    chatInfo.lastActivity = Date.now();

    // Se já está com atendente humano, não responde mais automaticamente
    // Mas marca a mensagem como não lida para facilitar a triagem
    if (chatInfo.state === CHAT_STATES.WITH_HUMAN) {
      try {
        await message.markUnread();
      } catch (error) {
        console.error("Erro ao marcar mensagem como não lida:", error);
      }
      return;
    }

    // Processar o estado atual da conversa
    let updatedChatInfo = await processCurrentState(
      message,
      chat,
      messageContent,
      chatInfo
    );

    // Verificar número de tentativas inválidas e reiniciar conversa se necessário
    if (updatedChatInfo.invalidAttempts >= BOT_CONFIG.MAX_INVALID_ATTEMPTS) {
      await message.reply(
        "Notei que você está tendo dificuldades. Vamos recomeçar para facilitar."
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await sendWelcomeMessage(message, chat);
      updatedChatInfo.state = CHAT_STATES.MENU_SHOWN;
      updatedChatInfo.invalidAttempts = 0;
    }

    // Atualizar o registro da conversa
    activeChats.set(contactId, updatedChatInfo);

    // Atualizar estatísticas
    statsService.updateActiveChatsCount(activeChats.size);
  } catch (error) {
    console.error("Erro ao processar mensagem:", error);
  }
}

// Sua função processCurrentState existente
async function processCurrentState(message, chat, messageContent, chatInfo) {
  switch (chatInfo.state) {
    // Estado inicial - primeira interação
    case CHAT_STATES.INITIAL:
      await sendWelcomeMessage(message, chat);
      chatInfo.state = CHAT_STATES.MENU_SHOWN;
      break;

    // Menu principal mostrado - cliente escolhendo opção
    case CHAT_STATES.MENU_SHOWN:
      return await handleMainMenu(message, chat, messageContent, chatInfo);

    // Estados específicos para cada fluxo de opção
    case CHAT_STATES.PRICE_CHECK_ASK_IF_CLIENT:
      return await PriceFlow.handleIsClientResponse(
        message,
        chat,
        messageContent,
        chatInfo
      );

    case CHAT_STATES.PRICE_CHECK_IS_CLIENT:
      return await PriceFlow.handleClientCPF(
        message,
        chat,
        messageContent,
        chatInfo
      );

    case CHAT_STATES.PRICE_CHECK_NOT_CLIENT:
      return await PriceFlow.handleNonClientChoice(
        message,
        chat,
        messageContent,
        chatInfo
      );

    // Novo estado para primeiro solicitar CPF e depois data de nascimento
    case CHAT_STATES.PRICE_CHECK_CREATE_ACCOUNT_CPF:
      return await PriceFlow.handleCreateAccountCPF(
        message,
        chat,
        messageContent,
        chatInfo
      );

    // Estado para data de nascimento após CPF validado
    case CHAT_STATES.PRICE_CHECK_CREATE_ACCOUNT_BIRTHDATE:
      return await PriceFlow.handleBirthdate(
        message,
        chat,
        messageContent,
        chatInfo
      );

    case CHAT_STATES.PRICE_CHECK_NO_ACCOUNT:
      chatInfo = await PriceFlow.handleProductName(
        message,
        chat,
        messageContent,
        chatInfo
      );
      return await transferToAgent(message, chat, chatInfo);

    // Opção 2 - Disponibilidade de produtos
    case CHAT_STATES.OPTION_SELECTED:
      if (chatInfo.option === MENU_OPTIONS.PRODUCT_AVAILABILITY) {
        chatInfo = await ProductFlow.handleProductAvailability(
          message,
          chat,
          messageContent,
          chatInfo
        );
        return await transferToAgent(message, chat, chatInfo);
      } else if (chatInfo.option === MENU_OPTIONS.TALK_TO_AGENT) {
        chatInfo = await AgentFlow.handleAgentSubject(
          message,
          chat,
          messageContent,
          chatInfo
        );
        return await transferToAgent(message, chat, chatInfo);
      }
      break;

    // Estados específicos para entrega
    case CHAT_STATES.DELIVERY_CONFIRMATION:
      return await DeliveryFlow.handleDeliveryConfirmation(
        message,
        chat,
        messageContent,
        chatInfo
      );

    case CHAT_STATES.DELIVERY_PRODUCTS:
      chatInfo = await DeliveryFlow.handleDeliveryProducts(
        message,
        chat,
        messageContent,
        chatInfo
      );
      return await transferToAgent(message, chat, chatInfo);

    case CHAT_STATES.DELIVERY_DECLINED:
      return await DeliveryFlow.handleDeliveryDeclined(
        message,
        chat,
        messageContent,
        chatInfo
      );
  }

  return chatInfo;
}

/**
 * Envia mensagem de boas-vindas e menu de opções
 */
async function sendWelcomeMessage(message, chat) {
  await chat.sendStateTyping();

  try {
    // Pequeno delay para simular digitação
    await new Promise((resolve) =>
      setTimeout(resolve, BOT_CONFIG.TYPING_DELAY_MEDIUM)
    );
    await message.reply(messages.welcome);

    // Outro pequeno delay antes de enviar o menu
    await new Promise((resolve) =>
      setTimeout(resolve, BOT_CONFIG.TYPING_DELAY_SHORT)
    );
    await message.reply(messages.menu_options);
  } catch (error) {
    console.error("Erro ao enviar mensagem de boas-vindas:", error);
  }
}

/**
 * Processa a escolha de opção do menu principal
 */
async function handleMainMenu(message, chat, messageContent, chatInfo) {
  const option = messageContent.trim();

  if (
    [
      MENU_OPTIONS.PRICE_CHECK,
      MENU_OPTIONS.PRODUCT_AVAILABILITY,
      MENU_OPTIONS.DELIVERY_INFO,
      MENU_OPTIONS.TALK_TO_AGENT,
    ].includes(option)
  ) {
    chatInfo.option = option;
    chatInfo.invalidAttempts = 0; // Resetar tentativas inválidas

    switch (option) {
      case MENU_OPTIONS.PRICE_CHECK: // Consulta de preços
        return await PriceFlow.start(message, chat, chatInfo);

      case MENU_OPTIONS.PRODUCT_AVAILABILITY: // Disponibilidade de produtos
        return await ProductFlow.start(message, chat, chatInfo);

      case MENU_OPTIONS.DELIVERY_INFO: // Informações de entrega
        return await DeliveryFlow.start(message, chat, chatInfo);

      case MENU_OPTIONS.TALK_TO_AGENT: // Falar com atendente
        return await AgentFlow.start(message, chat, chatInfo);
    }
  } else {
    await message.reply(messages.invalid_option);
    chatInfo.invalidAttempts++; // Incrementar tentativas inválidas
  }

  return chatInfo;
}

/**
 * Transfere para atendente humano
 */
async function transferToAgent(message, chat, chatInfo) {
  await chat.sendStateTyping();

  try {
    // Pequeno delay para simular digitação
    await new Promise((resolve) =>
      setTimeout(resolve, BOT_CONFIG.TYPING_DELAY_MEDIUM)
    );
    await message.reply(messages.transferring_to_agent);

    // Marcar como transferido para humano - bot não responde mais
    chatInfo.state = CHAT_STATES.WITH_HUMAN;
    chatInfo.transferredAt = Date.now();

    // Atualizar estatísticas
    statsService.markChatTransferred();

    // Tentar marcar a mensagem como não lida para facilitar a triagem
    try {
      await message.markUnread();
    } catch (error) {
      console.error("Erro ao marcar mensagem como não lida:", error);
    }

    // Log com os dados coletados
    console.log(`Cliente ${message.from} aguardando atendimento humano.`);
    console.log(`Opção escolhida: ${chatInfo.option}`);
    console.log(`Dados coletados:`, chatInfo.data);
    console.log(
      `Tempo de conversa com o bot: ${Math.round(
        (Date.now() - chatInfo.conversationStart) / 1000
      )} segundos`
    );

    // Gerar relatório de atendimento
    generateAndPrintReport();
  } catch (error) {
    console.error("Erro ao transferir para atendente:", error);
  }

  return chatInfo;
}

/**
 * Gera e exibe um relatório de atendimento
 */
function generateAndPrintReport() {
  const report = generateAttendanceReport(activeChats, statsService.getStats());
  printReport(report);
  saveReport(report);
  return report;
}

/**
 * Limpa conversas inativas periodicamente
 */
function setupCleanupInterval() {
  setInterval(() => {
    const now = Date.now();
    let removedCount = 0;

    // Limpar chats inativos
    for (const [clientId, chatInfo] of activeChats.entries()) {
      if (now - chatInfo.lastActivity > BOT_CONFIG.INACTIVE_TIMEOUT) {
        // Atualizar estatísticas antes de remover
        if (chatInfo.state === CHAT_STATES.WITH_HUMAN) {
          statsService.withHuman--;
        }

        activeChats.delete(clientId);
        removedCount++;
        console.log(`Conversa com ${clientId} removida por inatividade.`);
      }
    }

    if (removedCount > 0) {
      console.log(`${removedCount} conversas inativas foram removidas.`);
      statsService.updateActiveChatsCount(activeChats.size);
    }

    // Gerar relatório periódico
    generateAndPrintReport();
  }, BOT_CONFIG.CLEANUP_INTERVAL);
}

// Iniciar limpeza automática
setupCleanupInterval();

// Exportar funções necessárias
module.exports = {
  handleMessage,
  generateAndPrintReport,
  getActiveChats: () => activeChats,
};
// src/handlers/messageHandler.js
