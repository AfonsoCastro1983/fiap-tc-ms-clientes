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
      if (!value || !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error('Email inválido');
      }
    }
  }