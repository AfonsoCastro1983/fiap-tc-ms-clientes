import jwt from "jsonwebtoken";
import { IClienteGateway } from "../../../application/interfaces/IClienteGateway";
import { ClienteRepository } from "../repositories/Cliente";
import { Cliente } from "../../../domain/entities/Cliente";
import { Email } from "../../../shared/valueobjects/Email";
import { CPF } from "../../../shared/valueobjects/CPF";
import { AppDataSource } from '../../../infra/database/data-source';

export class ClienteGateway implements IClienteGateway {
    public gerarClientePorRepositorio(repCliente: ClienteRepository): Cliente {
        let emailObj: Email | undefined;
        if (repCliente.email != "") {
            emailObj = new Email(repCliente.email);
        }

        let cpfObj: CPF | undefined;
        if (repCliente.cpf != "") {
            cpfObj = new CPF(repCliente.cpf);
        }
        const cli = new Cliente(repCliente.id, repCliente.nome, emailObj, cpfObj, repCliente.idcognito);
        return cli
    }

    async salvar(cliente: Cliente): Promise<Cliente> {
        let clienteRepository = new ClienteRepository();
        const repCliente = AppDataSource.getRepository(ClienteRepository);

        if (cliente.cpf && cliente.cpf.value != "") {
            console.log('CPF',cliente.cpf.value);
            const cliPesqCPF = await this.buscarPorCPF(cliente.cpf.value);
            if (cliPesqCPF && cliPesqCPF.id != 0) {
                console.log('CPF',cliPesqCPF);
                return cliPesqCPF;
            }
        }
        if (cliente.email && cliente.email.value != "") {
            const cliEmail = await this.buscarPorEmail(cliente.email.value);
            if (cliEmail && cliEmail.id != 0) {
                console.log('Email',cliEmail);
                return cliEmail
            }
        }

        console.log('Entrou para gravar');
        let novo = new ClienteRepository();
        novo.cpf = cliente.cpf?.value || "";
        novo.email = cliente.email?.value || "";
        novo.nome = cliente.nome;
        novo.idcognito = cliente.idcognito;
        novo.ultima_modificacao = new Date();
        clienteRepository = await repCliente.save(novo);

        return this.gerarClientePorRepositorio(clienteRepository);
    }

    async buscarPorID(id: number): Promise<Cliente> {
        const repCliente = await AppDataSource.getRepository(ClienteRepository).findOneBy({ id: id });
        if (repCliente) {
            return this.gerarClientePorRepositorio(repCliente);
        }
        else {
            return new Cliente(0, "");
        }
    }

    async buscarPorCPF(cpf: string): Promise<Cliente> {
        const repCliente = await AppDataSource.getRepository(ClienteRepository).findOneBy({ cpf: cpf });
        if (repCliente) {
            return this.gerarClientePorRepositorio(repCliente);
        }
        else {
            return new Cliente(0, "");
        }

    }

    async buscarPorEmail(email: string): Promise<Cliente> {
        const repCliente = await AppDataSource.getRepository(ClienteRepository).findOneBy({ email: email });
        if (repCliente) {
            return this.gerarClientePorRepositorio(repCliente);
        }
        else {
            return new Cliente(0, "");
        }
    }

    async buscarPorToken(token: string): Promise<Cliente> {
        token = token.replace('Bearer ','');
        
        const decoded = jwt.decode(token);
        console.log("Decoded: ",decoded);
        const idcognito = (decoded as any).sub;
        console.log("userID: ",idcognito);

        const repCliente = await AppDataSource.getRepository(ClienteRepository).findOneBy({ idcognito: idcognito});
        if (repCliente) {
            return this.gerarClientePorRepositorio(repCliente);
        }
        else {
            return new Cliente(0,"");
        }
    }
}