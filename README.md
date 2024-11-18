# Lanchonete API - Pós-Tech FIAP - Arquitetura de Software

Este repositório contém o código-fonte para as APIs de gerenciamento de clientes da Lanchonete, desenvolvido durante o primeiro módulo da Pós-Tech FIAP de Arquitetura de Software. O projeto foi atualizado para usar uma arquitetura baseada em micro serviços e implementado com tecnologias modernas para escalabilidade e manutenção.

## Tecnologias Utilizadas

- **TypeScript**: Linguagem de programação.
- **PostgreSQL**: Sistema de gerenciamento de banco de dados.
- **Docker**: Ferramenta de virtualização e orquestração de containers.
- **Swagger**: Ferramenta de documentação de APIs.
- **TypeORM**: ORM (Object-Relational Mapping) para qualquer banco de dados.
- **Amazon ECS**: Serviço gerenciado para execução de containers.
- **AWS Lambda**: Serviço de computação serverless que executa código em resposta a eventos, sem necessidade de gerenciar servidores.
- **API Gateway**: Serviço gerenciado que permite criar, publicar e gerenciar APIs seguras e escaláveis para acessar aplicações backend.

## APIs de Clientes

### Domínios e Entidades

A API de gerenciamento de clientes inclui as seguintes classes de domínio:

- **Cliente**: Representa um cliente da lanchonete.

### Endpoints

- **POST /cliente**: Criação de um novo cliente.
- **GET /cliente/cpf**: Busca de um cliente usando CPF.
- **GET /cliente/email**: Busca de um cliente usando e-mail.
- **PUT /cliente**: Atualização de dados de um cliente existente.
- **DELETE /cliente/{id}**: Exclusão de um cliente pelo identificador.

### Documentação da API

A documentação da API pode ser acessada através do Swagger no ambiente local:

```bash
http://localhost:8000/docs
```

Para o ambiente em produção na AWS, utilize o link abaixo:

[Documentação na AWS](https://seu-endpoint-api/docs).

### Regras de Negócio Aplicadas

- **Validação de Dados**: Verificação de CPF e e-mail únicos antes da criação de um cliente.
- **Autenticação**: Integração com o AWS Cognito para autenticação e autorização de acesso.
- **Atualização Segura**: Controle de concorrência para garantir que a última modificação não seja sobrescrita por dados desatualizados.

## Arquitetura AWS para Micro Serviços

A aplicação foi implementada usando Amazon ECS para orquestração de containers, garantindo escalabilidade e facilidade de gerenciamento. A arquitetura segue os princípios de uma implementação baseada em micro serviços.

### Descrição da Arquitetura

#### ECS Cluster
O **ECS Cluster** gerencia os serviços e tasks, orquestrando os containers e garantindo alta disponibilidade.

#### VPC e Subnets
Uma **VPC** foi configurada com subnets públicas e privadas para isolar os recursos e garantir a segurança dos dados.

#### RDS PostgreSQL
Um banco de dados relacional gerenciado pela AWS RDS armazena os dados dos clientes, com backups automáticos e alta disponibilidade.

#### API Gateway
O **API Gateway** gerencia e protege os endpoints das APIs, integrando-se ao AWS Cognito para autenticação e autorização.

#### AWS Lambda
Funções Lambda foram criadas para processar eventos assíncronos, como notificações de cadastro e logs de auditoria.

---

## Comandos para Inicializar o Serviço na Máquina Local

1. **Clonar o repositório:**
    ```bash
    git clone https://github.com/AfonsoCastro1983/fiap-tc-ms-clientes.git
    ```

2. **Instalar as dependências:**
    ```bash
    cd fiap-tc-ms-clientes
    npm install
    ```

3. **Iniciar os serviços Docker:**
    ```bash
    docker build
    docker up
    ```

4. **Acessar a documentação da API Swagger:**
    [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Observações

- Este projeto foi atualizado para usar Amazon ECS e arquitetura de micro serviços.
- Foco exclusivo no gerenciamento de APIs de Clientes para simplificação e escalabilidade.
- Para mais informações sobre o código e a arquitetura do projeto, consulte os arquivos de código-fonte e a documentação interna.