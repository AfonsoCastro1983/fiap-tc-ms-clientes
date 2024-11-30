import ClienteController from '../src/infra/http/controllers/ClienteController';
import { ClienteGateway } from '../src/infra/database/gateways/ClienteGateway';
import { Cliente } from '../src/domain/entities/Cliente';
import { CPF } from '../src/shared/valueobjects/CPF';
import { Email } from '../src/shared/valueobjects/Email';

jest.mock('../src/infra/database/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('../src/infra/database/gateways/ClienteGateway');

const idValue = 0;
const nomeValue = 'João Silva';
const cpfValue = '93941938045';
const emailValue = 'joao@email.com';
const cognitoValue = 'cognito123';

describe('Controller de Clientes', () => {
  let clienteController: ClienteController;
  let clienteGatewayMock: jest.Mocked<ClienteGateway>;

  beforeEach(() => {
    clienteGatewayMock = new ClienteGateway() as jest.Mocked<ClienteGateway>;
    clienteController = new ClienteController(clienteGatewayMock);
  });

  describe("Cenário: Salvar um cliente com sucesso", () => {
    it("DADO um cliente com dados válidos, QUANDO eu tentar salvá-lo, ENTÃO o cliente deve ser salvo com sucesso", async () => {
      const mockCliente = new Cliente(idValue, nomeValue, new Email(emailValue), new CPF(cpfValue), cognitoValue);
      const mockResponse = {
        id: idValue,
        nome: nomeValue,
        cpf: cpfValue,
        email: emailValue,
      };

      clienteGatewayMock.salvar.mockResolvedValue(mockCliente);

      const response = await clienteController.salvarCliente({
        nome: mockCliente.nome,
        cpf: cpfValue,
        email: emailValue,
        idcognito: mockCliente.idcognito,
      });

      // Validação do formato de resposta simplificado
      expect(response).toEqual(mockResponse);

      // Comparação usando valores extraídos dos getters
      expect(clienteGatewayMock.salvar).toHaveBeenCalledWith(expect.objectContaining(mockCliente));
    });
  });

  describe("Cenário: Criar um cliente sem CPF e e-mail com sucesso", () => {
    it("DADO um cliente sem CPF e e-mail, QUANDO eu tentar salvá-lo, ENTÃO o cliente deve ser salvo com sucesso", async () => {
      const mockCliente = new Cliente(idValue, nomeValue, undefined, undefined, cognitoValue);
      const mockResponse = {
        id: 0,
        nome: mockCliente.nome,
        cpf: '',
        email: ''
      }

      clienteGatewayMock.salvar.mockResolvedValue(mockCliente);

      const response = await clienteController.salvarCliente({
        nome: mockCliente.nome,
        cpf: '',
        email: '',
        idcognito: mockCliente.idcognito
      });

      // Validação do formato de resposta simplificado
      expect(response).toEqual(mockResponse);

      // Comparação usando valores extraídos dos getters
      expect(clienteGatewayMock.salvar).toHaveBeenCalledWith(expect.objectContaining(mockCliente));
    });
  });

  describe("Cenário: Cadastrar cliente com um e-mail inválido", () => {
    it("DADO um novo cadastro, QUANDO eu inserir um e-mail muito longo, ENTÃO dovo receber uma mensagem 'Email muito longo'", async () => {
      await expect(
        clienteController.salvarCliente({
          nome: nomeValue,
          cpf: cpfValue,
          email: 'meunomecompletousandomuitaspalavrasenumeros12345@meudominioextensamentecomprido.com.br',
          idcognito: cognitoValue
        })
      ).rejects.toThrow('Email muito longo');
    });

    it("DADO um novo cadastro, QUANDO eu inserir um e-mail com domínio muito longo, ENTÃO dovo receber uma mensagem 'Parte local do email muito longa'", async () => {
      await expect(
        clienteController.salvarCliente({
          nome: nomeValue,
          cpf: cpfValue,
          email: 'nome@meudominioextensamentecompridousandomuitaspalavrasenumeros123.com.br',
          idcognito: cognitoValue
        })
      ).rejects.toThrow('Parte local do email muito longa');
    });

    it("DADO um novo cadastro, QUANDO eu inserir um e-mail inválido, ENTÃO dovo receber uma mensagem 'Email inválido'", async () => {
      await expect(
        clienteController.salvarCliente({
          nome: nomeValue,
          cpf: cpfValue,
          email: 'teste de e-mail',
          idcognito: cognitoValue
        })
      ).rejects.toThrow('Email inválido');
    });
  });

  describe("Cenário: Buscar cliente por CPF com sucesso", () => {
    it("DADO um CPF válido, QUANDO eu buscar o cliente, ENTÃO os dados do cliente devem ser retornados", async () => {
      const mockCliente = new Cliente(idValue, nomeValue, new Email(emailValue), new CPF(cpfValue), cognitoValue);

      clienteGatewayMock.buscarPorCPF.mockResolvedValue(mockCliente);

      const response = await clienteController.buscarCPF(cpfValue);

      // Comparar apenas as propriedades relevantes
      expect(response).toEqual({
        id: mockCliente.id,
        nome: mockCliente.nome,
        cpf: mockCliente.cpf?.value || '',
        email: mockCliente.email?.value || '',
      });
      expect(clienteGatewayMock.buscarPorCPF).toHaveBeenCalledWith(cpfValue);
    });
  });

  describe("Cenário: Retornar cliente zerado ao buscar por CPF inexistente", () => {
    it("DADO um CPF inexistente, QUANDO eu buscar o cliente, ENTÃO deve retornar um cliente com dados zerados", async () => {
      const clienteZerado = new Cliente(0, '');
      clienteGatewayMock.buscarPorCPF.mockResolvedValue(clienteZerado);

      const response = await clienteController.buscarCPF('98765432100');

      expect(response).toEqual({
        id: 0,
        nome: '',
        cpf: '',
        email: '',
      });
      expect(clienteGatewayMock.buscarPorCPF).toHaveBeenCalledWith('98765432100');
    });
  });

  describe("Cenário: Buscar cliente por e-mail com sucesso", () => {
    it("DADO um e-mail válido, QUANDO eu buscar o cliente, ENTÃO os dados do cliente devem ser retornados", async () => {
      const mockCliente = new Cliente(idValue, nomeValue, new Email(emailValue), new CPF(cpfValue), cognitoValue);

      clienteGatewayMock.buscarPorEmail.mockResolvedValue(mockCliente);

      const response = await clienteController.buscarEmail(emailValue);

      // Comparar apenas as propriedades relevantes
      expect(response).toEqual({
        id: mockCliente.id,
        nome: mockCliente.nome,
        cpf: mockCliente.cpf?.value || '',
        email: mockCliente.email?.value || '',
      });
      expect(clienteGatewayMock.buscarPorEmail).toHaveBeenCalledWith(emailValue);
    });
  });

  describe("Cenário: Retornar cliente zerado ao buscar por e-mail inexistente", () => {
    it("DADO um e-mail inexistente, QUANDO eu buscar o cliente, ENTÃO deve retornar um cliente com dados zerados", async () => {
      const clienteZerado = new Cliente(0, '');

      clienteGatewayMock.buscarPorEmail.mockResolvedValue(clienteZerado);

      const response = await clienteController.buscarEmail('naoexiste@email.com');

      expect(response).toEqual({
        id: 0,
        nome: '',
        cpf: '',
        email: '',
      });
      expect(clienteGatewayMock.buscarPorEmail).toHaveBeenCalledWith('naoexiste@email.com');
    });
  });

});
