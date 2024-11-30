export class Email {
  private _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  private validate(value: string): void {
    // Validação mais robusta e menos propensa a problemas de backtracking
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    // Validações adicionais
    if (value.length > 80) {
      throw new Error('Email muito longo');
    }

    const parts = value.split('@');
    if ((parts.length == 2) && (parts[1].length > 64)) {
      throw new Error('Parte local do email muito longa');
    }
    
    if (!value || !emailRegex.test(value)) {
      throw new Error('Email inválido');
    }
  }
}