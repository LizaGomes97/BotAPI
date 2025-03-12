// src/handlers/utils/validation.js

/**
 * Valida um CPF
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} - Se o CPF é válido
 */
function validateCPF(cpf) {
  // Remover caracteres não numéricos
  cpf = cpf.replace(/\D/g, "");

  // Verificar se tem 11 dígitos
  if (cpf.length !== 11) {
    return false;
  }

  // Verificar se todos os dígitos são iguais (CPF inválido, mas com formato correto)
  if (/^(\d)\1+$/.test(cpf)) {
    return false;
  }

  // Para uma validação mais completa, você poderia implementar o algoritmo de verificação
  // dos dígitos verificadores do CPF, mas para exemplo básico isso já é suficiente

  return true;
}

/**
 * Valida uma data no formato DD/MM/AAAA
 * @param {string} dateStr - Data a ser validada
 * @returns {boolean} - Se a data é válida
 */
function validateDate(dateStr) {
  let day, month, year;

  // Verificar formato DD/MM/AAAA
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split("/");
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1; // meses em JS são 0-11
    year = parseInt(parts[2], 10);
  }
  // Verificar formato DDMMAAAA
  else if (/^\d{8}$/.test(dateStr)) {
    day = parseInt(dateStr.substring(0, 2), 10);
    month = parseInt(dateStr.substring(2, 4), 10) - 1;
    year = parseInt(dateStr.substring(4, 8), 10);
  }
  //nenhum formato reconhecido
  else {
    return false;
  }

  // Criar data e verificar se é válida
  const date = new Date(year, month, day);

  // Verificar se a data é válida e não está no futuro
  return (
    date.getDate() === day &&
    date.getMonth() === month &&
    date.getFullYear() === year &&
    date <= new Date()
  );
}

/**
 * Valida se uma mensagem é um comando esperado
 * @param {string} message - Mensagem a ser validada
 * @param {Array<string>} expectedOptions - Opções esperadas
 * @returns {boolean} - Se a mensagem é uma das opções esperadas
 */
function validateOption(message, expectedOptions) {
  const trimmedMessage = message.trim();
  return expectedOptions.includes(trimmedMessage);
}

/**
 * Verifica se um texto está vazio ou tem tamanho inadequado
 * @param {string} text - Texto a ser validado
 * @param {number} minLength - Tamanho mínimo (opcional)
 * @param {number} maxLength - Tamanho máximo (opcional)
 * @returns {boolean} - Se o texto é válido
 */
function validateText(text, minLength = 1, maxLength = 1000) {
  if (!text || typeof text !== "string") {
    return false;
  }

  const trimmedText = text.trim();
  return trimmedText.length >= minLength && trimmedText.length <= maxLength;
}

module.exports = {
  validateCPF,
  validateDate,
  validateOption,
  validateText,
};
