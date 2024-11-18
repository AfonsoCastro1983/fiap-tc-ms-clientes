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

describe('ClienteController', () => {
  let clienteController: ClienteController;
  let clienteGatewayMock: jest.Mocked<ClienteGateway>;

  beforeEach(() => {
    clienteGatewayMock = new ClienteGateway() as jest.Mocked<ClienteGateway>;
    clienteController = new ClienteController(clienteGatewayMock);
  });

  it('deve salvar um cliente com sucesso', async () => {
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

  it('deve criar um cliente sem CPF e e-mail com sucesso', async () => {
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

  it('deve buscar cliente por CPF com sucesso', async () => {
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

  it('deve retornar um cliente zerado ao buscar por CPF inexistente', async () => {
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

  it('deve buscar cliente por e-mail com sucesso', async () => {
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

  it('deve retornar um cliente zerado ao buscar por e-mail inexistente', async () => {
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
