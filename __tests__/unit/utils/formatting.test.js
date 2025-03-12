const {
  formatCPF,
  formatDate,
} = require("../../../src/handlers/utils/formatting");

describe("Formatting Functions", () => {
  describe("formatCPF", () => {
    test("deve formatar CPF sem pontos e traços", () => {
      expect(formatCPF("07695480592")).toBe("076.954.805-92");
    });

    test("deve aceitar CPF já formatado", () => {
      expect(formatCPF("076.954.805-92")).toBe("076.954.805-92");
    });
  });

  describe("formatDate", () => {
    test("deve formatar data sem barras", () => {
      expect(formatDate("27091997")).toBe("27/09/1997");
    });

    test("deve aceitar data já formatada", () => {
      expect(formatDate("27/09/1997")).toBe("27/09/1997");
    });
  });
});
