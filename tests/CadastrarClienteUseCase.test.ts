import { CadastrarClienteUseCase } from '../src/application/usecases/CadastrarClienteUseCase';
import { ClienteGateway } from '../src/infra/database/gateways/ClienteGateway';
import { Cliente } from '../src/domain/entities/Cliente';
import { Email } from '../src/shared/valueobjects/Email';
import { CPF } from '../src/shared/valueobjects/CPF';

jest.mock('../src/infra/database/gateways/ClienteGateway');

const idValue = 0;
const nomeValue = 'João Silva';
const idcognitoValue = 'cognito123';
const emailValue = 'joao@email.com';
const cpfValue = '93941938045';

describe('CadastrarClienteUseCase', () => {
  let clienteGatewayMock: jest.Mocked<ClienteGateway>;
  let cadastrarClienteUseCase: CadastrarClienteUseCase;

  beforeEach(() => {
    clienteGatewayMock = new ClienteGateway() as jest.Mocked<ClienteGateway>;
    cadastrarClienteUseCase = new CadastrarClienteUseCase(clienteGatewayMock);
  });


  describe("Cenário: Cadastrar um cliente com dados válidos", () => {
    it("DADO um cliente com dados válidos, QUANDO eu tentar cadastrá-lo, ENTÃO o cliente deve ser salvo com sucesso", async () => {

      const mockCliente = new Cliente(idValue, nomeValue, undefined, undefined, idcognitoValue);
      clienteGatewayMock.salvar.mockResolvedValue(mockCliente);

      const dto = {
        nome: nomeValue,
        idcognito: idcognitoValue,
        email: emailValue,
        cpf: cpfValue,
      };

      const cliente = await cadastrarClienteUseCase.execute(dto);

      expect(cliente).toEqual(mockCliente);
      expect(clienteGatewayMock.salvar).toHaveBeenCalledWith(expect.objectContaining({
        nome: 'João Silva',
        idcognito: 'cognito123',
      }));
    });
  });

  describe("Cenário: Retornar erro ao cadastrar cliente com CPF já existente", () => {
    it("DADO um cliente com CPF já cadastrado, QUANDO eu tentar cadastrá-lo, ENTÃO deve lançar um erro informando que o CPF já existe", async () => {
      clienteGatewayMock.salvar.mockRejectedValue(new Error('CPF já cadastrado'));

      const dto = {
        nome: nomeValue,
        idcognito: idcognitoValue,
        email: emailValue,
        cpf: cpfValue,
      };

      await expect(cadastrarClienteUseCase.execute(dto)).rejects.toThrow('CPF já cadastrado');
    });
  });

  describe("Cenário: Buscar um cliente por CPF com sucesso", () => {
    it("DADO um CPF válido, QUANDO eu buscar o cliente, ENTÃO os dados do cliente devem ser retornados", async () => {
      const mockCliente = new Cliente(idValue, nomeValue, undefined, undefined, idcognitoValue);
      clienteGatewayMock.buscarPorCPF.mockResolvedValue(mockCliente);

      const cliente = await cadastrarClienteUseCase.buscarPorCPF(cpfValue);

      expect(cliente).toEqual(mockCliente);
      expect(clienteGatewayMock.buscarPorCPF).toHaveBeenCalledWith(cpfValue);
    });
  });

  describe("Cenário: Retornar cliente zerado ao buscar por CPF inexistente", () => {
    it("DADO um CPF inexistente, QUANDO eu buscar o cliente, ENTÃO deve retornar um cliente com dados zerados", async () => {
      const clienteZerado = new Cliente(0, '');
      clienteGatewayMock.buscarPorCPF.mockResolvedValue(clienteZerado);

      const cliente = await cadastrarClienteUseCase.buscarPorCPF('98765432100');

      expect(cliente).toEqual(clienteZerado); // Verifica se o cliente "zerado" é retornado
      expect(clienteGatewayMock.buscarPorCPF).toHaveBeenCalledWith('98765432100');
    });
  });

  describe("Cenário: Buscar um cliente por e-mail com sucesso", () => {
    it("DADO um e-mail válido, QUANDO eu buscar o cliente, ENTÃO os dados do cliente devem ser retornados", async () => {
      const mockCliente = new Cliente(1, nomeValue, new Email(emailValue), new CPF(cpfValue), idcognitoValue);

      clienteGatewayMock.buscarPorEmail.mockResolvedValue(mockCliente);

      const cliente = await cadastrarClienteUseCase.buscarPorEmail(emailValue);

      expect(cliente).toEqual(mockCliente); // Compara a instância do cliente mockado
      expect(clienteGatewayMock.buscarPorEmail).toHaveBeenCalledWith(emailValue); // Certifica-se de que o método foi chamado com o e-mail correto
    });
  });

  describe("Cenário: Retornar cliente zerado ao buscar por e-mail inexistente", () => {
    it("DADO um e-mail inexistente, QUANDO eu buscar o cliente, ENTÃO deve retornar um cliente com dados zerados", async () => {
      const clienteZerado = new Cliente(0, '');

      clienteGatewayMock.buscarPorEmail.mockResolvedValue(clienteZerado);

      const cliente = await cadastrarClienteUseCase.buscarPorEmail('naoexiste@email.com');

      expect(cliente).toEqual(clienteZerado); // Compara com o cliente zerado
      expect(clienteGatewayMock.buscarPorEmail).toHaveBeenCalledWith('naoexiste@email.com');
    });
  });

  describe("Cenário: Buscar um cliente por ID com sucesso", () => {
    it("DADO um ID válido, QUANDO eu buscar o cliente, ENTÃO os dados do cliente devem ser retornados", async () => {
      const mockCliente = new Cliente(idValue, nomeValue, new Email(emailValue), new CPF(cpfValue), idcognitoValue);

      clienteGatewayMock.buscarPorID.mockResolvedValue(mockCliente);

      const cliente = await cadastrarClienteUseCase.get(idValue);

      expect(cliente).toEqual(mockCliente); // Compara a instância do cliente mockado
      expect(clienteGatewayMock.buscarPorID).toHaveBeenCalledWith(idValue); // Certifica-se de que o método foi chamado com o ID correto
    });
  });

  describe("Cenário: Retornar cliente zerado ao buscar por ID inexistente", () => {
    it("DADO um ID inexistente, QUANDO eu buscar o cliente, ENTÃO deve retornar um cliente com dados zerados", async () => {
      const clienteZerado = new Cliente(0, '');

      clienteGatewayMock.buscarPorID.mockResolvedValue(clienteZerado);

      const cliente = await cadastrarClienteUseCase.get(999);

      expect(cliente).toEqual(clienteZerado); // Compara com o cliente zerado
      expect(clienteGatewayMock.buscarPorID).toHaveBeenCalledWith(999);
    });
  });
});
