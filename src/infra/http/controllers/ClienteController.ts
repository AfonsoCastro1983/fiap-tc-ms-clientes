import { Body, Path, Post, Get, Route, Tags } from "tsoa";
import { CadastrarClienteDto } from "../../../domain/dto/CadastrarClienteDto";
import { CadastrarClienteUseCase } from "../../../application/usecases/CadastrarClienteUseCase";
import { ClienteGateway } from "../../database/gateways/ClienteGateway";

export interface ClienteRequest {
    nome: string;
    idcognito: string,
    email: string;
    cpf: string;
}

interface ClienteResponse {
    id: number;
    nome: string;
    cpf: string;
    email: string;
}

@Route("cliente")
@Tags("Cliente")
export default class ClienteController {
    private cadastrarClienteUseCase: CadastrarClienteUseCase;

    constructor(clienteGateway: ClienteGateway) {
        this.cadastrarClienteUseCase = new CadastrarClienteUseCase(clienteGateway);
    }
    /**
     * Cadastro do cliente: nome e e-mail
     */
    @Post("/")
    public async salvarCliente(@Body() body: ClienteRequest): Promise<ClienteResponse> {
        const dto: CadastrarClienteDto = {
            nome: body.nome,
            idcognito: body.idcognito,
            email: body.email,
            cpf: body.cpf
        }

        console.log(dto);

        const cliente = await this.cadastrarClienteUseCase.execute(dto);

        return {
            id: cliente.id,
            nome: cliente.nome,
            cpf: cliente.cpf?.value || "",
            email: cliente.email?.value || "",
        }
    }
    /**
     * Buscar por CPF
     */
    @Get("/cpf/:cpf")
    public async buscarCPF(@Path() cpf: string): Promise<ClienteResponse> {
        const cliente = await this.cadastrarClienteUseCase.buscarPorCPF(cpf);

        return {
            id: cliente.id,
            nome: cliente.nome,
            cpf: cliente.cpf?.value || "",
            email: cliente.email?.value || "",
        }

    }
    /**
     * Buscar por E-mail
     */
    @Get("/email/:email")
    public async buscarEmail(@Path() email: string): Promise<ClienteResponse> {
        const cliente = await this.cadastrarClienteUseCase.buscarPorEmail(email);

        return {
            id: cliente.id,
            nome: cliente.nome,
            cpf: cliente.cpf?.value || "",
            email: cliente.email?.value || "",
        }

    }
}