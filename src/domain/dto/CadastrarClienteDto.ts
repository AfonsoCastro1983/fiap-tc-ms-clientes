import { IsNotEmpty, IsEmail, IsOptional, Matches } from 'class-validator';

export class CadastrarClienteDto {
  @IsNotEmpty({ message: 'Nome não pode ser vazio' })
  nome: string = "";

  @IsNotEmpty({ message: 'ID Cognito não pode ser vazio' })
  idcognito: string = "";

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos' })
  cpf?: string;
}