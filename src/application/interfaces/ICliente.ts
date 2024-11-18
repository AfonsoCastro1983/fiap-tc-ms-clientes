import { Email } from "../../shared/valueobjects/Email";
import { CPF } from "../../shared/valueobjects/CPF";

export interface ICliente {
    id: number;
    idcognito: string;
    nome: string;
    email?: Email;
    cpf?: CPF;
}