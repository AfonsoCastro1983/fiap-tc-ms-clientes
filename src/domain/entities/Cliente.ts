import { Email } from "../../shared/valueobjects/Email";
import { CPF } from "../../shared/valueobjects/CPF";
import { ICliente } from "../../application/interfaces/ICliente";

export class Cliente implements ICliente {
  private _id: number;
  private _nome: string;
  private _idcognito: string;
  private _email?: Email;
  private _cpf?: CPF;

  constructor(id: number, nome: string, email?: Email, cpf?: CPF, idcognito?: string) {
    this._id = id;
    this._idcognito = 'vazio';
    if (idcognito) {
      this._idcognito = idcognito;
    }
    this._nome = nome;
    this._email = email;
    this._cpf = cpf;
  }

  get id(): number {
    return this._id;
  }

  get idcognito(): string {
    return this._idcognito;
  }

  set idcognito(value: string) {
    this._idcognito = value;
  }

  get nome(): string {
    return this._nome;
  }

  get email(): Email | undefined {
    return this._email;
  }

  get cpf(): CPF | undefined {
    return this._cpf;
  }

  setEmail(email: Email): void {
    this._email = email;
  }

  setCpf(cpf: CPF): void {
    this._cpf = cpf;
  }
}