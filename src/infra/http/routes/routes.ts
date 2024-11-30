import express from "express";
import ClienteController from "../controllers/ClienteController";
import { ClienteGateway } from "../../database/gateways/ClienteGateway";

const router = express.Router()

//Clientes
router.post("/cliente", async (req, res) => {
    try {
        const controller = new ClienteController(new ClienteGateway());
        const cliente = await controller.salvarCliente(req.body);

        return res.status(201).send({
            id: cliente.id,
            nome: cliente.nome,
            email: cliente.email,
            cpf: cliente.cpf,
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ erro: error.message });
        }
    }
});

router.get("/cliente/cpf/:cpf", async (req, res) => {
    try {
        const controller = new ClienteController(new ClienteGateway());
        const cliente = await controller.buscarCPF(req.params.cpf);

        return res.status(201).send({ cliente });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ erro: error.message });
        }
    }
});

///Identificação do cliente via Email
router.get("/cliente/email/:email", async (req, res) => {
    try {
        const controller = new ClienteController(new ClienteGateway());
        const cliente = await controller.buscarEmail(req.params.email);

        return res.status(201).send({ cliente });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ erro: error.message });
        }
    }
});

///Identificação de cliente através do jwt
router.get("/cliente/token/", async (req, res) => {
    try {
        const controller = new ClienteController(new ClienteGateway());
        if (req.headers.authorization) {
            const cliente = await controller.buscarPorToken(req.headers.authorization);

            return res.status(201).send({ cliente });
        }
        else {
            return res.status(500).json({ erro: 'Autorização inválida'});
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ erro: error.message });
        }
    }
});

export default router;