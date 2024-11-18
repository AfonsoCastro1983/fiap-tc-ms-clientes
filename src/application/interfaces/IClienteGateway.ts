import { Cliente } from "../../domain/entities/Cliente";

export interface IClienteGateway {
    salvar(cliente: Cliente): Promise<Cliente>;
    buscarPorID(id: number): Promise<Cliente>;
    buscarPorCPF(cpf: string): Promise<Cliente>;
    buscarPorEmail(email: string): Promise<Cliente>;
    buscarPorToken(token: string): Promise<Cliente>;
}