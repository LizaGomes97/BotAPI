// __tests__/unit/utils/validation.test.js
const {
  validateCPF,
  validateDate,
} = require("../../../src/handlers/utils/validation");

describe("Validation Functions", () => {
  describe("validateCPF", () => {
    test("deve aceitar CPF válido com formatação", () => {
      expect(validateCPF("076.954.805-92")).toBe(true);
    });

    test("deve aceitar CPF válido sem formatação", () => {
      expect(validateCPF("07695480592")).toBe(true);
    });

    test("deve rejeitar CPF com menos de 11 dígitos", () => {
      expect(validateCPF("1234567890")).toBe(false);
    });

    test("deve rejeitar CPF com todos os dígitos iguais", () => {
      expect(validateCPF("11111111111")).toBe(false);
    });
  });

  describe("validateDate", () => {
    test("deve aceitar data válida no formato DD/MM/AAAA", () => {
      expect(validateDate("27/09/1997")).toBe(true);
    });

    test("deve aceitar data sem formataçao", () => {
      expect(validateDate("27091997")).toBe(true);
    });

    test("nao deve aceitar menos que 8 digitos", () => {
      expect(validateDate("270997")).toBe(false);
    });

    test("deve rejeitar data em formato inválido", () => {
      expect(validateDate("1997-09-27")).toBe(false);
    });

    test("deve rejeitar data inexistente (31 de fevereiro)", () => {
      expect(validateDate("31/02/2023")).toBe(false);
    });

    test("deve rejeitar data futura", () => {
      const futureYear = new Date().getFullYear() + 1;
      expect(validateDate(`01/01/${futureYear}`)).toBe(false);
    });

    test("deve rejeitar texto aleatório", () => {
      expect(validateDate("não sou uma data")).toBe(false);
    });
  });
});
