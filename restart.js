// restart.js - Script para manter o bot em execução contínua
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Este script gerencia o bot WhatsApp, reiniciando-o automaticamente
 * caso ocorra qualquer problema, garantindo disponibilidade contínua.
 */

// Configurações
const MAX_RESTART_ATTEMPTS = 10;
const RESTART_DELAY = 10000; // 10 segundos
const RESET_ATTEMPTS_AFTER = 60 * 60 * 1000; // 1 hora
const SESSION_FILE = path.join(process.cwd(), "session.json");
const USER_DATA_DIR = path.join(process.cwd(), "user_data");

// Contadores
let attempts = 0;
let consecutiveFailures = 0;
let lastRestartTime = Date.now();

// Monitoramento
let uptime = 0;
let startTime = Date.now();

// Função para limpar sessão em caso de problemas repetidos
function cleanSessionIfNeeded() {
  if (consecutiveFailures >= 3) {
    console.log(
      "\n[MONITOR] Múltiplas falhas detectadas. Limpando dados de sessão..."
    );

    // Remover arquivo de sessão
    if (fs.existsSync(SESSION_FILE)) {
      try {
        fs.unlinkSync(SESSION_FILE);
        console.log("[MONITOR] Arquivo de sessão removido");
      } catch (error) {
        console.error(
          "[MONITOR] Erro ao remover arquivo de sessão:",
          error.message
        );
      }
    }

    // Remover diretório de dados do usuário
    if (fs.existsSync(USER_DATA_DIR)) {
      try {
        fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
        console.log("[MONITOR] Diretório de dados do usuário removido");
      } catch (error) {
        console.error(
          "[MONITOR] Erro ao remover diretório de dados do usuário:",
          error.message
        );
      }
    }

    consecutiveFailures = 0;
  }
}

// Função para iniciar o bot
function startBot() {
  attempts++;

  // Resetar contador de tentativas após um período
  if (Date.now() - lastRestartTime > RESET_ATTEMPTS_AFTER) {
    console.log(
      "\n[MONITOR] Resetando contador de tentativas após período estável"
    );
    attempts = 1;
    consecutiveFailures = 0;
  }

  lastRestartTime = Date.now();

  // Verificar número máximo de tentativas
  if (attempts > MAX_RESTART_ATTEMPTS) {
    console.error(
      `\n[MONITOR] Número máximo de tentativas (${MAX_RESTART_ATTEMPTS}) atingido em curto período.`
    );
    console.log("[MONITOR] Aguardando 1 hora antes de tentar novamente...");

    setTimeout(() => {
      attempts = 0;
      consecutiveFailures = 0;
      startBot();
    }, RESET_ATTEMPTS_AFTER);

    return;
  }

  // Limpar sessão se houver muitas falhas consecutivas
  cleanSessionIfNeeded();

  console.log(
    `\n[MONITOR] Iniciando o bot (tentativa ${attempts}/${MAX_RESTART_ATTEMPTS})...`
  );
  console.log(`[MONITOR] Tempo em execução: ${formatUptime()}`);

  // Iniciar o processo do bot
  const botProcess = spawn("node", ["src/index.js"], {
    stdio: "inherit",
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  // Monitorar o processo
  botProcess.on("exit", (code) => {
    uptime += (Date.now() - startTime) / 1000 / 60; // em minutos

    if (code !== 0) {
      console.log(`\n[MONITOR] Bot encerrado com código de erro: ${code}`);
      consecutiveFailures++;
      console.log(
        `[MONITOR] Reiniciando bot em ${RESTART_DELAY / 1000} segundos...`
      );
      setTimeout(startBot, RESTART_DELAY);
    } else {
      console.log("\n[MONITOR] Bot encerrado normalmente.");
      process.exit(0);
    }
  });

  // Reiniciar contagem de tempo
  startTime = Date.now();

  // Capturar sinais para encerramento adequado
  process.on("SIGINT", () => {
    console.log(
      "\n[MONITOR] Sinal de interrupção recebido. Encerrando o bot..."
    );
    botProcess.kill("SIGINT");
    setTimeout(() => {
      console.log("[MONITOR] Forçando encerramento...");
      process.exit(0);
    }, 5000);
  });
}

// Formatar tempo de atividade
function formatUptime() {
  const minutes = Math.floor(uptime);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return `${minutes}m`;
  }
}

// Exibir banner
console.log("\n=============================================");
console.log("🤖 MONITOR DE EXECUÇÃO CONTÍNUA - BOT DROGASIL");
console.log("=============================================");
console.log("Este script mantém o bot em execução,");
console.log("reiniciando-o automaticamente se ele falhar.");
console.log("=============================================");

// Iniciar o bot pela primeira vez
startBot();
