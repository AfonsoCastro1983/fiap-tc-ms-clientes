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

describe('Gateway de Clientes', () => {
  let clienteGateway: ClienteGateway;
  const mockRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
    clienteGateway = new ClienteGateway();
  });

  describe("Cenário: Salvar um cliente com sucesso", () => {
    it("DADO um cliente com dados válidos, QUANDO eu tentar salvá-lo, ENTÃO o cliente deve ser salvo com sucesso", async () => {
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
  });

  describe("Cenário: Atualizar um cliente quando o CPF já existir", () => {
    it("DADO um CPF válido e já existente, QUANDO eu salvar um cliente, ENTÃO deverá ser atualizado o cliente já gravado", async() => {
      const cliente = new Cliente(idValue, 'Novo Nome', new Email(emailValue), new CPF(cpfValue), cognitoValue);
      const savedCliente = new ClienteRepository();
      savedCliente.id = 1;
      savedCliente.nome = nomeValue;
      savedCliente.email = emailValue;
      savedCliente.cpf = cpfValue;
      const updatedCliente = new ClienteRepository();
      savedCliente.id = 1;
      savedCliente.nome = 'Novo Nome';
      savedCliente.email = emailValue;
      savedCliente.cpf = cpfValue;
      mockRepository.findOneBy.mockResolvedValue(savedCliente);      
      mockRepository.save.mockResolvedValue(updatedCliente);

      const result = await clienteGateway.salvar(cliente);

      expect(result.id).toBe(1);
      expect(result.nome).toBe('Novo Nome');
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        nome: nomeValue,
        email: emailValue,
        cpf: cpfValue,
      }));
    });
  });

  describe("Cenário: Buscar um cliente por CPF com sucesso", () => {
    it("DADO um CPF válido, QUANDO eu buscar o cliente, ENTÃO os dados do cliente devem ser retornados", async () => {
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
  });

  describe("Cenário: Retornar cliente zerado ao buscar por CPF inexistente", () => {
    it("DADO um CPF inexistente, QUANDO eu buscar o cliente, ENTÃO deve retornar um cliente com dados zerados", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await clienteGateway.buscarPorCPF('00000000000');

      expect(result.id).toBe(0);
      expect(result.nome).toBe('');
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ cpf: '00000000000' });
    });
  });

  describe("Cenário: Buscar um cliente por e-mail com sucesso", () => {
    it("DADO um e-mail válido, QUANDO eu buscar o cliente, ENTÃO os dados do cliente devem ser retornados", async () => {
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
  });

  describe("Cenário: Buscar um cliente por um ID com sucesso", () => {
    it("DADO um ID válido, QUANDO eu buscar o cliente, ENTÃO os dados do cliente devem ser retornados", async () => {
      const mockCliente = new ClienteRepository();
      mockCliente.id = 1;
      mockCliente.nome = nomeValue;
      mockCliente.cpf = cpfValue;
      mockCliente.email = emailValue;

      mockRepository.findOneBy.mockResolvedValue(mockCliente);

      const result = await clienteGateway.buscarPorID(1);

      expect(result.id).toBe(1);
      expect(result.nome).toBe(nomeValue);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe("Cenário: Buscar um cliente por um ID inválido", () => {
    it("DADO um ID inválido, QUANDO eu buscar o cliente, ENTÃO retornará um cliente zerado", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await clienteGateway.buscarPorID(1);

      expect(result.id).toBe(0);
      expect(result.nome).toBe('');
    });
  });

  describe("Cenário: Buscar um cliente por token JWT com sucesso", () => {
    it("DADO um token JWT válido, QUANDO eu buscar o cliente, ENTÃO os dados do cliente devem ser retornados", async () => {
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
  });

  describe("Cenário: Retornar cliente zerado ao buscar por token JWT inexistente", () => {
    it("DADO um token JWT inexistente, QUANDO eu buscar o cliente, ENTÃO deve retornar um cliente com dados zerados", async () => {
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
});