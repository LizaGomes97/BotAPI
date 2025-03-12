// src/handlers/utils/reporting.js
const { formatDuration, extractPhoneFromWhatsAppId } = require("./formatting");
const { CHAT_STATES } = require("../../config/constants");

/**
 * Gera um relatório de atendimento
 * @param {Map} activeChats - Mapa de chats ativos
 * @param {Object} stats - Estatísticas globais
 * @returns {Object} - Relatório de atendimento
 */
function generateAttendanceReport(activeChats, stats) {
  const now = new Date();

  const report = {
    timestamp: now.toISOString(),
    date: now.toLocaleDateString("pt-BR"),
    time: now.toLocaleTimeString("pt-BR"),
    stats: {
      totalConversations: stats.totalChats,
      activeConversations: stats.activeChats,
      waitingForHuman: stats.waitingForHuman,
      withHuman: stats.withHuman,
      completedChats: stats.completedChats || 0,
      optionCounts: stats.optionCounts || {},
    },
  };

  // Adicionar detalhes dos clientes
  if (activeChats && activeChats.size > 0) {
    report.clients = {
      total: activeChats.size,
      details: Array.from(activeChats.entries()).map(([id, chat]) => ({
        id: extractPhoneFromWhatsAppId(id),
        state: chat.state,
        option: chat.option || "Nenhuma",
        waitingTime:
          chat.state === CHAT_STATES.WITH_HUMAN && chat.transferredAt
            ? formatDuration(now - new Date(chat.transferredAt))
            : "N/A",
        lastActivity: formatDuration(now - new Date(chat.lastActivity)),
      })),
    };
  }

  return report;
}

/**
 * Exibe o relatório no console
 * @param {Object} report - Relatório de atendimento
 */
function printReport(report) {
  console.log("\n=== RELATÓRIO DE ATENDIMENTO ===");
  console.log(`Data/Hora: ${report.date} ${report.time}`);
  console.log(
    `Total de conversas desde o início: ${report.stats.totalConversations}`
  );
  console.log(`Conversas ativas: ${report.stats.activeConversations}`);
  console.log(`Aguardando atendimento humano: ${report.stats.waitingForHuman}`);
  console.log(`Em atendimento humano: ${report.stats.withHuman}`);

  if (report.stats.optionCounts) {
    console.log("\nDistribuição de opções:");
    const options = {
      1: "Consulta de preços",
      2: "Disponibilidade de produtos",
      3: "Informações de entrega",
      4: "Falar com atendente",
    };

    for (const [option, count] of Object.entries(report.stats.optionCounts)) {
      if (options[option]) {
        console.log(`  ${options[option]}: ${count}`);
      }
    }
  }

  if (report.clients && report.clients.details.length > 0) {
    console.log("\nClientes ativos:");
    report.clients.details.forEach((client, index) => {
      console.log(`  ${index + 1}. Telefone: ${client.id}`);
      console.log(`     Estado: ${client.state}`);
      console.log(`     Opção: ${client.option}`);
      console.log(`     Última atividade: ${client.lastActivity}`);
      if (client.waitingTime !== "N/A") {
        console.log(`     Tempo de espera: ${client.waitingTime}`);
      }
    });
  }

  console.log("=================================\n");
}

/**
 * Salva o relatório em um arquivo
 * @param {Object} report - Relatório de atendimento
 * @param {string} filePath - Caminho do arquivo para salvar (opcional)
 */
function saveReport(report, filePath = "./reports") {
  const fs = require("fs");
  const path = require("path");

  try {
    // Criar diretório se não existir
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    // Criar nome de arquivo com timestamp
    const date = new Date();
    const fileName = `report_${date.toISOString().replace(/[:.]/g, "-")}.json`;
    const fullPath = path.join(filePath, fileName);

    // Salvar relatório
    fs.writeFileSync(fullPath, JSON.stringify(report, null, 2));
    console.log(`Relatório salvo em ${fullPath}`);
  } catch (error) {
    console.error("Erro ao salvar relatório:", error);
  }
}

module.exports = {
  generateAttendanceReport,
  printReport,
  saveReport,
};
