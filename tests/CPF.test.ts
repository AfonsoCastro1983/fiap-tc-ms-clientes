import { CPF } from '../src/shared/valueobjects/CPF';

describe('CPF', () => {
  it('deve criar uma instância com CPF válido', () => {
    const cpfValue = '123.456.789-09';
    const cpf = new CPF(cpfValue);
    expect(cpf.value).toBe('123.456.789-09');
  });

  it('deve lançar erro para CPF com menos de 11 dígitos', () => {
    const cpfValue = '123.456.78';
    expect(() => new CPF(cpfValue)).toThrowError('CPF inválido');
  });

  it('deve lançar erro para CPF com mais de 11 dígitos', () => {
    const cpfValue = '123.456.789.012';
    expect(() => new CPF(cpfValue)).toThrowError('CPF inválido');
  });

  it('deve lançar erro para CPF com todos os dígitos iguais', () => {
    const cpfValue = '111.111.111-11';
    expect(() => new CPF(cpfValue)).toThrowError('CPF inválido');
  });

  it('deve lançar erro para CPF com dígitos verificadores incorretos', () => {
    const cpfValue = '123.456.789-00';
    expect(() => new CPF(cpfValue)).toThrowError('CPF inválido');
  });

  it('deve aceitar CPF com caracteres não numéricos', () => {
    const cpfValue = '123.456.789-09';
    const cpf = new CPF(cpfValue);
    expect(cpf.value).toBe('123.456.789-09');
  });

  it('deve lançar erro para CPF em branco', () => {
    const cpfValue = '';
    expect(() => new CPF(cpfValue)).toThrowError('CPF inválido');
  });

  it('deve lançar erro para CPF com apenas espaços', () => {
    const cpfValue = '   ';
    expect(() => new CPF(cpfValue)).toThrowError('CPF inválido');
  });
});
