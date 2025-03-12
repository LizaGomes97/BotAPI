// src/services/statisticsService.js
const fs = require("fs");
const { formatDuration } = require("../handlers/utils/formatting");

// Classe Singleton para gerenciar estatísticas
class StatisticsService {
  constructor() {
    // Garantir que só existe uma instância
    if (StatisticsService.instance) {
      return StatisticsService.instance;
    }

    // Inicializar estatísticas
    this.stats = {
      totalChats: 0,
      activeChats: 0,
      waitingForHuman: 0,
      withHuman: 0,
      completedChats: 0,
      optionCounts: {
        1: 0, // Consulta de preços
        2: 0, // Disponibilidade de produtos
        3: 0, // Informações de entrega
        4: 0, // Falar com atendente
      },
      startTime: Date.now(),
      lastUpdated: Date.now(),
    };

    // Tentar carregar estatísticas salvas
    this.loadStats();

    // Configurar salvamento periódico
    setInterval(() => this.saveStats(), 5 * 60 * 1000); // A cada 5 minutos

    StatisticsService.instance = this;
  }

  /**
   * Incrementa o contador de chats totais
   */
  incrementTotalChats() {
    this.stats.totalChats++;
    this.stats.activeChats++;
    this.stats.lastUpdated = Date.now();
  }

  /**
   * Incrementa o contador para uma opção específica
   * @param {string} option - Opção escolhida
   */
  incrementOptionCount(option) {
    if (this.stats.optionCounts[option] !== undefined) {
      this.stats.optionCounts[option]++;
      this.stats.lastUpdated = Date.now();
    }
  }

  /**
   * Marca um chat como transferido para atendente
   */
  markChatTransferred() {
    this.stats.waitingForHuman++;
    this.stats.withHuman++;
    this.stats.lastUpdated = Date.now();
  }

  /**
   * Marca um chat como concluído/encerrado
   */
  markChatCompleted() {
    this.stats.activeChats--;
    this.stats.completedChats++;
    this.stats.lastUpdated = Date.now();
  }

  /**
   * Atualiza o número de chats ativos
   * @param {number} count - Número de chats ativos
   */
  updateActiveChatsCount(count) {
    this.stats.activeChats = count;
    this.stats.lastUpdated = Date.now();
  }

  /**
   * Obtém todas as estatísticas atuais
   * @returns {Object} - Estatísticas atuais
   */
  getStats() {
    return {
      ...this.stats,
      uptime: formatDuration(Date.now() - this.stats.startTime),
    };
  }

  /**
   * Gera um relatório de estatísticas
   * @param {Map} activeChats - Mapa de chats ativos
   * @returns {Object} - Relatório de estatísticas
   */
  generateReport(activeChats) {
    const now = new Date();

    const report = {
      timestamp: now.toISOString(),
      date: now.toLocaleDateString("pt-BR"),
      time: now.toLocaleTimeString("pt-BR"),
      stats: {
        totalConversations: this.stats.totalChats,
        activeConversations: this.stats.activeChats,
        waitingForHuman: this.stats.waitingForHuman,
        withHuman: this.stats.withHuman,
        completedChats: this.stats.completedChats,
        uptime: formatDuration(Date.now() - this.stats.startTime),
        optionCounts: this.stats.optionCounts,
      },
    };

    // Adicionar detalhes dos clientes se activeChats estiver disponível
    if (activeChats && activeChats.size > 0) {
      report.clients = {
        total: activeChats.size,
        details: Array.from(activeChats.entries()).map(([id, chat]) => ({
          id: id.split("@")[0],
          state: chat.state,
          option: chat.option || "Nenhuma",
          waitingTime:
            chat.state === "with_human" && chat.transferredAt
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
   * @param {Map} activeChats - Mapa de chats ativos
   */
  printReport(activeChats) {
    const report = this.generateReport(activeChats);

    console.log("\n=== RELATÓRIO DE ATENDIMENTO ===");
    console.log(`Data/Hora: ${report.date} ${report.time}`);
    console.log(
      `Total de conversas desde o início: ${report.stats.totalConversations}`
    );
    console.log(`Conversas ativas: ${report.stats.activeConversations}`);
    console.log(
      `Aguardando atendimento humano: ${report.stats.waitingForHuman}`
    );
    console.log(`Em atendimento humano: ${report.stats.withHuman}`);
    console.log(`Tempo de execução: ${report.stats.uptime}`);
    console.log("\nDistribuição de opções:");

    const options = {
      1: "Consulta de preços",
      2: "Disponibilidade de produtos",
      3: "Informações de entrega",
      4: "Falar com atendente",
    };

    for (const [option, count] of Object.entries(report.stats.optionCounts)) {
      console.log(`  ${options[option]}: ${count}`);
    }

    console.log("=================================\n");

    return report;
  }

  /**
   * Salva as estatísticas em um arquivo
   */
  saveStats() {
    try {
      fs.writeFileSync(
        "./bot_stats.json",
        JSON.stringify(this.stats, null, 2),
        "utf8"
      );
    } catch (error) {
      console.error("Erro ao salvar estatísticas:", error);
    }
  }

  /**
   * Carrega estatísticas de um arquivo
   */
  loadStats() {
    try {
      if (fs.existsSync("./bot_stats.json")) {
        const savedStats = JSON.parse(
          fs.readFileSync("./bot_stats.json", "utf8")
        );

        // Mesclar estatísticas salvas com as padrões
        this.stats = {
          ...this.stats,
          ...savedStats,
          // Resetar contadores que devem ser iniciados do zero
          activeChats: 0,
          waitingForHuman: 0,
          withHuman: 0,
          // Atualizar timestamp de início
          startTime: Date.now(),
          lastUpdated: Date.now(),
        };

        console.log("Estatísticas carregadas com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  }
}

// Exportar uma instância única
module.exports = new StatisticsService();
