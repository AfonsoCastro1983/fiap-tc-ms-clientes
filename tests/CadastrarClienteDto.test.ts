import { CadastrarClienteDto } from '../src/domain/dto/CadastrarClienteDto';
import { validate } from 'class-validator';

describe('CadastrarClienteDto', () => {
  describe('Validações de Criação', () => {
    it('Deve criar um DTO com valores padrão', () => {
      const dto = new CadastrarClienteDto();
      
      expect(dto.nome).toBe('');
      expect(dto.idcognito).toBe('');
      expect(dto.email).toBeUndefined();
      expect(dto.cpf).toBeUndefined();
    });

    it('Deve criar um DTO com valores preenchidos', () => {
      const dto = new CadastrarClienteDto();
      dto.nome = 'João Silva';
      dto.idcognito = 'cognito-123';
      dto.email = 'joao@exemplo.com';
      dto.cpf = '12345678900';

      expect(dto.nome).toBe('João Silva');
      expect(dto.idcognito).toBe('cognito-123');
      expect(dto.email).toBe('joao@exemplo.com');
      expect(dto.cpf).toBe('12345678900');
    });
  });

  describe('Validações de Campos', () => {
    it('Deve validar DTO com campos obrigatórios', async () => {
      const dto = new CadastrarClienteDto();
      dto.nome = 'João Silva';
      dto.idcognito = 'cognito-123';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('Deve falhar se nome estiver vazio', async () => {
      const dto = new CadastrarClienteDto();
      dto.nome = '';
      dto.idcognito = 'cognito-123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('nome');
    });

    it('Deve falhar se idcognito estiver vazio', async () => {
      const dto = new CadastrarClienteDto();
      dto.nome = 'João Silva';
      dto.idcognito = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('idcognito');
    });

    it('Deve validar email com formato correto', async () => {
      const dto = new CadastrarClienteDto();
      dto.nome = 'João Silva';
      dto.idcognito = 'cognito-123';
      dto.email = 'joao@exemplo.com';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('Deve falhar com email inválido', async () => {
      const dto = new CadastrarClienteDto();
      dto.nome = 'João Silva';
      dto.idcognito = 'cognito-123';
      dto.email = 'email-invalido';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('Deve validar CPF com formato correto', async () => {
      const dto = new CadastrarClienteDto();
      dto.nome = 'João Silva';
      dto.idcognito = 'cognito-123';
      dto.cpf = '12345678900';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});