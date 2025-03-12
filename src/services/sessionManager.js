// src/services/sessionManager.js
const fs = require("fs");
const { BOT_CONFIG } = require("../config/constants");

/**
 * Gerencia a sessão do WhatsApp
 */
class SessionManager {
  constructor() {
    this.sessionData = null;
    this.sessionPath = BOT_CONFIG.SESSION_FILE_PATH;
    this.qrCodePath = BOT_CONFIG.QR_CODE_FILE_PATH;
  }

  /**
   * Carrega a sessão do arquivo
   * @returns {Object|null} - Dados da sessão ou null se não houver
   */
  loadSession() {
    try {
      if (fs.existsSync(this.sessionPath)) {
        this.sessionData = JSON.parse(fs.readFileSync(this.sessionPath));
        console.log("Sessão carregada com sucesso!");
        return this.sessionData;
      }
    } catch (error) {
      console.error("Erro ao carregar sessão:", error);
      this.sessionData = null;
    }

    return null;
  }

  /**
   * Salva a sessão em um arquivo
   * @param {Object} session - Dados da sessão para salvar
   */
  saveSession(session) {
    try {
      // Verificar se a sessão existe antes de tentar salvá-la
      if (!session) {
        console.log("Aviso: Tentativa de salvar uma sessão undefined");
        return;
      }

      this.sessionData = session;
      fs.writeFileSync(this.sessionPath, JSON.stringify(session));
      console.log("Sessão salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
    }
  }

  /**
   * Remove o arquivo de sessão
   */
  deleteSession() {
    try {
      if (fs.existsSync(this.sessionPath)) {
        fs.unlinkSync(this.sessionPath);
        console.log("Arquivo de sessão removido");
      }
      this.sessionData = null;
    } catch (error) {
      console.error("Erro ao remover arquivo de sessão:", error);
    }
  }

  /**
   * Salva o QR code em um arquivo para acesso remoto
   * @param {string} qrCode - String do QR code
   */
  saveQRCode(qrCode) {
    try {
      fs.writeFileSync(this.qrCodePath, qrCode);
      console.log(`QR Code salvo em ${this.qrCodePath}`);
    } catch (error) {
      console.error("Erro ao salvar QR code:", error);
    }
  }

  /**
   * Obtém os dados da sessão
   * @returns {Object|null} - Dados da sessão atual ou null
   */
  getSessionData() {
    return this.sessionData;
  }
}

// Exportar uma instância única
module.exports = new SessionManager();
