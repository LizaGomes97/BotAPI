// src/config/constants.js

/**
 * Estados possíveis de um chat
 */
const CHAT_STATES = {
  // Estados básicos
  INITIAL: "initial",
  MENU_SHOWN: "menu_shown",
  OPTION_SELECTED: "option_selected",
  WITH_HUMAN: "with_human",

  // Estados para consulta de preços
  PRICE_CHECK_ASK_IF_CLIENT: "price_check_ask_if_client",
  PRICE_CHECK_IS_CLIENT: "price_check_is_client",
  PRICE_CHECK_NOT_CLIENT: "price_check_not_client",
  PRICE_CHECK_CREATE_ACCOUNT_CPF: "price_check_create_account_cpf",
  PRICE_CHECK_CREATE_ACCOUNT_BIRTHDATE: "price_check_create_account_birthdate",
  PRICE_CHECK_NO_ACCOUNT: "price_check_no_account",

  // Estados para entrega
  DELIVERY_CONFIRMATION: "delivery_confirmation",
  DELIVERY_PRODUCTS: "delivery_products",
  DELIVERY_DECLINED: "delivery_declined",
};

/**
 * Configurações do bot
 */
const BOT_CONFIG = {
  // Tempos de espera
  TYPING_DELAY_SHORT: 500,
  TYPING_DELAY_MEDIUM: 1000,
  TYPING_DELAY_LONG: 2000,

  // Limites
  MAX_INVALID_ATTEMPTS: 3,
  INACTIVE_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hora

  // Caminhos de arquivos
  SESSION_FILE_PATH: "./session.json",
  QR_CODE_FILE_PATH: "./last_qrcode.txt",
  USER_DATA_DIR: "./user_data",

  // Configurações de região
  DEFAULT_DELIVERY_CITY: "Guanambi-BA",
  DEFAULT_DELIVERY_FEE: 7.0,
};

/**
 * Opções do menu principal
 */
const MENU_OPTIONS = {
  PRICE_CHECK: "1",
  PRODUCT_AVAILABILITY: "2",
  DELIVERY_INFO: "3",
  TALK_TO_AGENT: "4",
};

/**
 * Opções de resposta sim/não
 */
const YES_NO_OPTIONS = {
  YES: "1",
  NO: "2",
};

module.exports = {
  CHAT_STATES,
  BOT_CONFIG,
  MENU_OPTIONS,
  YES_NO_OPTIONS,
};
