import { ClienteGateway } from '../src/infra/database/gateways/ClienteGateway';
import { ClienteRepository } from '../src/infra/database/repositories/Cliente';
import { Cliente } from '../src/domain/entities/Cliente';
import { AppDataSource } from '../src/infra/database/data-source';
import { Email } from '../src/shared/valueobjects/Email';
import { CPF } from '../src/shared/valueobjects/CPF';
import jwt from 'jsonwebtoken';

jest.mock('../src/infra/database/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(),
}));

const idValue = 0;
const nomeValue = 'João Silva';
const cpfValue = '93941938045';
const emailValue = 'joao@email.com';
const cognitoValue = 'cognito123';

describe('ClienteGateway', () => {
  let clienteGateway: ClienteGateway;
  const mockRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
    clienteGateway = new ClienteGateway();
  });

  it('deve salvar um cliente com sucesso', async () => {
    const cliente = new Cliente(idValue, nomeValue, new Email(emailValue), new CPF(cpfValue), cognitoValue);
    const savedCliente = new ClienteRepository();
    savedCliente.id = 1;
    savedCliente.nome = nomeValue;
    savedCliente.email = emailValue;
    savedCliente.cpf = cpfValue;
    mockRepository.save.mockResolvedValue(savedCliente);

    const result = await clienteGateway.salvar(cliente);

    expect(result.id).toBe(1);
    expect(result.nome).toBe(nomeValue);
    expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      nome: nomeValue,
      email: emailValue,
      cpf: cpfValue,
    }));
  });

  it('deve buscar um cliente por CPF com sucesso', async () => {
    const mockCliente = new ClienteRepository();
    mockCliente.id = 1;
    mockCliente.nome = nomeValue;
    mockCliente.cpf = cpfValue;
    mockCliente.email = emailValue;

    mockRepository.findOneBy.mockResolvedValue(mockCliente);

    const result = await clienteGateway.buscarPorCPF(cpfValue);

    expect(result.id).toBe(1);
    expect(result.nome).toBe(nomeValue);
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ cpf: cpfValue });
  });

  it('deve retornar cliente zerado ao buscar por CPF inexistente', async () => {
    mockRepository.findOneBy.mockResolvedValue(null);

    const result = await clienteGateway.buscarPorCPF('00000000000');

    expect(result.id).toBe(0);
    expect(result.nome).toBe('');
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ cpf: '00000000000' });
  });

  it('deve buscar um cliente por e-mail com sucesso', async () => {
    const mockCliente = new ClienteRepository();
    mockCliente.id = 1;
    mockCliente.nome = nomeValue;
    mockCliente.cpf = cpfValue;
    mockCliente.email = emailValue;

    mockRepository.findOneBy.mockResolvedValue(mockCliente);

    const result = await clienteGateway.buscarPorEmail(emailValue);

    expect(result.id).toBe(1);
    expect(result.nome).toBe(nomeValue);
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: emailValue });
  });

  it('deve buscar um cliente por token JWT com sucesso', async () => {
    const decodedToken = { sub: cognitoValue };
    const mockCliente = new ClienteRepository();
    mockCliente.id = 1;
    mockCliente.nome = nomeValue;
    mockCliente.cpf = cpfValue;
    mockCliente.email = emailValue;
    mockCliente.idcognito = cognitoValue;

    (jwt.decode as jest.Mock).mockReturnValue(decodedToken);
    mockRepository.findOneBy.mockResolvedValue(mockCliente);

    const result = await clienteGateway.buscarPorToken('Bearer mock-token');

    expect(result.id).toBe(1);
    expect(result.nome).toBe(nomeValue);
    expect(jwt.decode).toHaveBeenCalledWith('mock-token');
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ idcognito: cognitoValue });
  });

  it('deve retornar cliente zerado ao buscar por token JWT inexistente', async () => {
    const decodedToken = { sub: cognitoValue };

    (jwt.decode as jest.Mock).mockReturnValue(decodedToken);
    mockRepository.findOneBy.mockResolvedValue(null);

    const result = await clienteGateway.buscarPorToken('Bearer mock-token');

    expect(result.id).toBe(0);
    expect(result.nome).toBe('');
    expect(jwt.decode).toHaveBeenCalledWith('mock-token');
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ idcognito: cognitoValue });
  });
});