const PriceFlow = require("../../../src/handlers/menuFlows/priceFlow.js");
const {
  CHAT_STATES,
  YES_NO_OPTIONS,
} = require("../../../src/config/constants.js");

describe("Price Flow", () => {
  //declarar variaveis para os mocks
  let message, chat, chatInfo;

  //configurar mocks antes de cada teste
  beforeEach(() => {
    message = {
      reply: jest.fn().mockResolvedValue(undefined), //cria uma funçao mock
    };
    chat = {
      sendStateTyping: jest.fn().mockResolvedValue(undefined), //cria uma funçao mock
    };

    chatInfo = {
      state: CHAT_STATES.PRICE_CHECK_ASK_IF_CLIENT,
      option: null,
      data: {},
      invalidAttempts: 0,
    };
  });

  //testes
  test("deve marcar usuario como cliente qunado a resposta é 1", async () => {
    //preparaçao
    const messageContent = "1"; //resposta do usuario dizendo que sim

    //execuçao
    const result = await PriceFlow.handleIsClientResponse(
      message,
      chat,
      messageContent,
      chatInfo
    );

    //verificaçao
    expect(chat.sendStateTyping).toHaveBeenCalled(); //verifica se a funçao foi chamada
    expect(message.reply).toHaveBeenCalled();
    expect(result.state).toBe(CHAT_STATES.PRICE_CHECK_IS_CLIENT);
    expect(result.data.isClient).toBe(true);
    expect(result.invalidAttempts).toBe(0);
  });

  test("deve marcar usuario como nao-cliente quando a resposta é 2", async () => {
    const messageContent = "2"; //resposta do usuario dizendo que nao

    const result = await PriceFlow.handleIsClientResponse(
      message,
      chat,
      messageContent,
      chatInfo
    );
    expect(result.state).toBe(CHAT_STATES.PRICE_CHECK_NOT_CLIENT);
    expect(result.data.isClient).toBe(false);
  });

  test("deve incrementar invalidAttemps quando a resposta é invalida", async () => {
    const messageContent = "resposta invalida"; //resposta do usuario invalida

    const result = await PriceFlow.handleIsClientResponse(
      message,
      chat,
      messageContent,
      chatInfo
    );

    expect(message.reply).toHaveBeenLastCalledWith(
      expect.stringContaining("inválida")
    );
    expect(result.invalidAttempts).toBe(1);
    expect(result.state).toBe(CHAT_STATES.PRICE_CHECK_ASK_IF_CLIENT);
  });

  test("deve completar o fluxo de criação de conta corretamente", async () => {
    //1.iniciar o fluxo
    chatInfo = await PriceFlow.start(message, chat, chatInfo);
    expect(chatInfo.state).toBe(CHAT_STATES.PRICE_CHECK_ASK_IF_CLIENT);

    //2.responder que nao é cliente
    chatInfo = await PriceFlow.handleIsClientResponse(
      message,
      chat,
      "2",
      chatInfo
    );
    expect(chatInfo.state).toBe(CHAT_STATES.PRICE_CHECK_NOT_CLIENT);

    //3.escolher criar conta
    chatInfo = await PriceFlow.handleNonClientChoice(
      message,
      chat,
      "1",
      chatInfo
    );
    expect(chatInfo.state).toBe(CHAT_STATES.PRICE_CHECK_CREATE_ACCOUNT_CPF);

    // 4. Informar CPF
    chatInfo = await PriceFlow.handleCreateAccountCPF(
      message,
      chat,
      "076.954.805-92",
      chatInfo
    );
    expect(chatInfo.state).toBe(
      CHAT_STATES.PRICE_CHECK_CREATE_ACCOUNT_BIRTHDATE
    );
    expect(chatInfo.data.cpf).toBe("076.954.805-92");

    // 5. Informar data de nascimento
    chatInfo = await PriceFlow.handleBirthdate(
      message,
      chat,
      "27/09/1997",
      chatInfo
    );
    expect(chatInfo.state).toBe(CHAT_STATES.PRICE_CHECK_NO_ACCOUNT);
    expect(chatInfo.data.birthdate).toBe("27/09/1997");

    // 6. Informar produto
    chatInfo = await PriceFlow.handleProductName(
      message,
      chat,
      "Losartana",
      chatInfo
    );
    expect(chatInfo.data.productName).toBe("Losartana");

    // Verificar todos os dados coletados
    expect(chatInfo.data).toEqual({
      isClient: false,
      willCreateAccount: true,
      cpf: "076.954.805-92",
      birthdate: "27/09/1997",
      productName: "Losartana",
    });
  });
});
