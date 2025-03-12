// src/index.js
const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const {
  handleMessage,
  generateAttendanceReport,
} = require("./handlers/messageHandler.js");

console.log("Inicializando o bot Drogasil...");

// MELHORIA 3: Configuração para executar em segundo plano
const puppeteerOptions = {
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
    "--disable-extensions",
    "--disable-component-extensions-with-background-pages",
    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-breakpad",
    "--disable-client-side-phishing-detection",
    "--disable-default-apps",
    "--disable-dev-shm-usage",
    "--disable-infobars",
    "--disable-notifications",
    "--disable-offer-store-unmasked-wallet-cards",
    "--disable-popup-blocking",
    "--disable-print-preview",
    "--disable-prompt-on-repost",
    "--disable-hang-monitor",
    "--disable-sync",
    "--disable-translate",
    "--disable-windows10-custom-titlebar",
    "--ignore-certificate-errors",
    "--ignore-certificate-errors-spki-list",
    "--mute-audio",
    "--no-service-autorun",
    "--password-store=basic",
    "--use-fake-ui-for-media-stream",
    "--use-mock-keychain",
    "--user-data-dir=./user_data",
    "--window-size=1920,1080",
  ],
  timeout: 120000,
};

// Configuração para salvar/carregar sessão para evitar escaneamento repetido do QR code
const SESSION_FILE_PATH = "./session.json";
let sessionData;

// Tentar carregar sessão existente
if (fs.existsSync(SESSION_FILE_PATH)) {
  try {
    sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH));
  } catch (error) {
    console.error("Erro ao carregar sessão:", error);
    sessionData = null;
  }
}

// Criar uma instância do cliente WhatsApp com opções avançadas
const client = new Client({
  puppeteer: puppeteerOptions,
  session: sessionData,
});

// Quando o QR code for recebido
client.on("qr", (qr) => {
  // Mostrar QR code no terminal
  console.log("QR Code recebido. Escaneie com seu WhatsApp:");
  qrcode.generate(qr, { small: true });

  // Também salvar QR code como imagem para acesso remoto
  try {
    fs.writeFileSync("./last_qrcode.txt", qr);
    console.log("QR Code salvo em last_qrcode.txt");
  } catch (error) {
    console.error("Erro ao salvar QR code:", error);
  }
});

// Evento de autenticação - salvar sessão
client.on("authenticated", (session) => {
  console.log("Autenticação bem-sucedida!");

  // Salvar sessão para reutilização
  try {
    sessionData = session;
    fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(session));
    console.log("Sessão salva com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar sessão:", error);
  }
});

// Quando o cliente estiver pronto
client.on("ready", () => {
  console.log("✅ Bot da Drogasil conectado e pronto para atender!");

  // Iniciar relatórios periódicos
  scheduleReports();
});

// Detectar novas mensagens
client.on("message", async (message) => {
  // Disponibilizar o cliente para o handler de mensagens
  global.client = client;
  await handleMessage(message);
});

// Evento de falha na autenticação
client.on("auth_failure", (error) => {
  console.error("Falha na autenticação:", error);

  // Remover arquivo de sessão em caso de falha
  if (fs.existsSync(SESSION_FILE_PATH)) {
    fs.unlinkSync(SESSION_FILE_PATH);
    console.log("Arquivo de sessão removido devido a falha na autenticação");
  }
});

// Evento de desconexão
client.on("disconnected", (reason) => {
  console.log("Bot desconectado:", reason);

  // Remover arquivo de sessão em caso de desconexão
  if (fs.existsSync(SESSION_FILE_PATH)) {
    fs.unlinkSync(SESSION_FILE_PATH);
    console.log("Arquivo de sessão removido devido à desconexão");
  }

  // Tentar reconectar automaticamente
  console.log("Tentando reconectar em 30 segundos...");
  setTimeout(() => {
    client.initialize();
  }, 30000);
});

// Inicializar o cliente
console.log("Preparando para inicializar o cliente...");
client.initialize();
console.log("Cliente inicializado, aguardando conexão...");

// Lidar com o encerramento do processo
process.on("SIGINT", async () => {
  console.log("Encerrando o bot...");

  // Gerar relatório final
  console.log("Gerando relatório final de atendimento...");
  generateAttendanceReport();

  // Destruir cliente
  await client.destroy();

  console.log("Bot encerrado com sucesso!");
  process.exit(0);
});

// Lidar com exceções não tratadas
process.on("uncaughtException", (error) => {
  console.error("Exceção não tratada:", error);

  // Tentar manter o bot em execução
  console.log("Tentando manter o bot em execução...");
});

// Agendar relatórios periódicos
function scheduleReports() {
  // Gerar relatório a cada hora
  setInterval(() => {
    console.log("Gerando relatório periódico...");
    generateAttendanceReport();
  }, 60 * 60 * 1000); // 1 hora

  // Gerar relatório inicial
  generateAttendanceReport();
}

// Definir tempo máximo para inicialização
const initTimeout = setTimeout(() => {
  console.error("Timeout na inicialização do bot! Tentando reiniciar...");

  if (fs.existsSync(SESSION_FILE_PATH)) {
    console.log("Removendo sessão atual...");
    fs.unlinkSync(SESSION_FILE_PATH);
  }

  // Reiniciar o processo inteiro
  console.log("Reiniciando processo...");
  process.exit(1); // Use um código de saída diferente de 0 para indicar erro
}, 120000); // 2 minutos

// Limpar timeout quando o cliente estiver pronto
client.on("ready", () => {
  clearTimeout(initTimeout);
});
