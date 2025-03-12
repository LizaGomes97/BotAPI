// src/index.js
const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const {
  handleMessage,
  generateAndPrintReport,
} = require("./handlers/messageHandler");
const sessionManager = require("./services/sessionManager");
const { BOT_CONFIG } = require("./config/constants");

console.log("Inicializando o bot Drogasil...");

// MELHORIA 3: Configuração para executar em segundo plano
const puppeteerOptions = {
  headless: true, // Voltar para true para executar em segundo plano
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
  ],
  timeout: 120000,
};

// Carregar sessão anterior, se existir
const sessionData = sessionManager.loadSession();

// Criar uma instância do cliente WhatsApp com opções avançadas
const client = new Client({
  puppeteer: puppeteerOptions,
  session: sessionData,
});

// Disponibilizar globalmente o cliente para uso nos handlers
global.client = client;

// Quando o QR code for recebido
client.on("qr", (qr) => {
  // Mostrar QR code no terminal
  console.log("QR Code recebido. Escaneie com seu WhatsApp:");
  qrcode.generate(qr, { small: true });

  // Salvar QR code para acesso remoto
  sessionManager.saveQRCode(qr);
});

// Evento de autenticação - salvar sessão
// Verificar no arquivo src/index.js
client.on("authenticated", (session) => {
  console.log("Autenticação bem-sucedida!");

  // Verificar se a sessão existe antes de salvá-la
  if (session) {
    sessionManager.saveSession(session);
  } else {
    console.log("Aviso: Evento 'authenticated' recebido sem dados de sessão");
  }
});

// Quando o cliente estiver pronto
client.on("ready", () => {
  console.log("✅ Bot da Drogasil conectado e pronto para atender!");

  // Gerar relatório inicial
  generateAndPrintReport();

  // Limpar timeout de inicialização
  if (initTimeout) {
    clearTimeout(initTimeout);
    initTimeout = null;
  }
});

// Detectar novas mensagens
client.on("message", async (message) => {
  await handleMessage(message);
});

// Evento de falha na autenticação
client.on("auth_failure", (error) => {
  console.error("Falha na autenticação:", error);
  sessionManager.deleteSession();
});

// Evento de desconexão
client.on("disconnected", (reason) => {
  console.log("Bot desconectado:", reason);
  sessionManager.deleteSession();

  // Tentar reconectar automaticamente se o processo continuar em execução
  console.log("Tentando reconectar em 30 segundos...");
  setTimeout(() => {
    if (!isShuttingDown) {
      console.log("Reiniciando cliente...");
      client.initialize();
    }
  }, 30000);
});

// Inicializar o cliente
console.log("Preparando para inicializar o cliente...");
client.initialize();
console.log("Cliente inicializado, aguardando conexão...");

// Controle de desligamento
let isShuttingDown = false;

// Lidar com o encerramento do processo
process.on("SIGINT", async () => {
  console.log("\nEncerrando o bot...");
  isShuttingDown = true;

  // Gerar relatório final
  console.log("Gerando relatório final de atendimento...");
  generateAndPrintReport();

  // Destruir cliente
  try {
    await client.destroy();
    console.log("Cliente WhatsApp desconectado com sucesso!");
  } catch (error) {
    console.error("Erro ao desconectar cliente WhatsApp:", error);
  }

  console.log("Bot encerrado com sucesso!");
  process.exit(0);
});

// Lidar com exceções não tratadas
process.on("uncaughtException", (error) => {
  console.error("Exceção não tratada:", error);

  // Apenas registrar o erro e tentar continuar
  console.log("Tentando manter o bot em execução...");
});

// Definir tempo máximo para inicialização
let initTimeout = setTimeout(() => {
  console.error("Timeout na inicialização do bot! Tentando reiniciar...");
  sessionManager.deleteSession();

  // Reiniciar o processo inteiro
  console.log("Reiniciando processo...");
  process.exit(1); // Use um código de saída diferente de 0 para indicar erro
}, BOT_CONFIG.INIT_TIMEOUT || 120000); // 2 minutos por padrão
