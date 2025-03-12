// src/handlers/utils/formatting.js

/**
 * Formata um CPF para exibição (XXX.XXX.XXX-XX)
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} - CPF formatado
 */
function formatCPF(cpf) {
  // Remover caracteres não numéricos
  cpf = cpf.replace(/\D/g, "");

  // Aplicar máscara
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Formata uma data para exibição amigável
 * @param {Date|string|number} date - Data a ser formatada
 * @returns {string} - Data formatada
 */

function formatDate(dateStr) {
  let day, month, year;

  // Verificar formato DD/MM/AAAA
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split("/");
    day = parts[0].padStart(2, "0");
    month = parts[1].padStart(2, "0");
    year = parts[2];
    return `${day}/${month}/${year}`;
  }
  // Verificar formato DDMMAAAA
  else if (/^\d{8}$/.test(dateStr)) {
    day = dateStr.substring(0, 2);
    month = dateStr.substring(2, 4);
    year = dateStr.substring(4, 8);
    return `${day}/${month}/${year}`;
  }

  // Se não reconhecer nenhum formato, retorna a string original
  return "Invalid Date";
}

/**
 * Formata um valor monetário
 * @param {number} value - Valor a ser formatado
 * @returns {string} - Valor formatado (R$ X,XX)
 */
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata uma duração em milissegundos para um formato legível
 * @param {number} ms - Duração em milissegundos
 * @returns {string} - Duração formatada
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Formata um número de telefone para exibição
 * @param {string} phone - Número do telefone (com ou sem código do país)
 * @returns {string} - Telefone formatado ((XX) XXXXX-XXXX)
 */
function formatPhone(phone) {
  // Remover tudo exceto dígitos
  phone = phone.replace(/\D/g, "");

  // Remover código do país, se existir
  if (phone.startsWith("55") && phone.length > 10) {
    phone = phone.substring(2);
  }

  // Aplicar máscara
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return phone;
}

/**
 * Extrai o número de telefone do formato padrão do WhatsApp
 * @param {string} whatsappId - ID do WhatsApp (formato: XXXXXXXXXXX@c.us)
 * @returns {string} - Número de telefone extraído
 */
function extractPhoneFromWhatsAppId(whatsappId) {
  return whatsappId.split("@")[0];
}

module.exports = {
  formatCPF,
  formatDate,
  formatCurrency,
  formatDuration,
  formatPhone,
  extractPhoneFromWhatsAppId,
};
