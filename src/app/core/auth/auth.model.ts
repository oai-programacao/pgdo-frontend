import { JwtPayload } from "jwt-decode"; // Importa a interface base do jwt-decode

// Interface para o payload customizado do seu JWT (estende o JwtPayload padrão)
export interface CustomJwtPayload extends JwtPayload {
  roles?: string[]; // Ex: ["ROLE_ADMIN", "ROLE_SELLER"]
  employeeId?: string; // Se o backend incluir o ID do funcionário no token
  name?: string; // Nome completo do usuário, se incluído
  email?: string; // Email do usuário, se incluído
  // Adicione outras claims customizadas que seu backend envia no Access Token
}

// Interface para o objeto de usuário que você vai armazenar no AuthService
export interface AuthenticatedUser {
  email: string; // Geralmente do 'sub' (subject) claim
  roles: string[];
  employeeId?: string;
  name?: string;
  // Outras informações úteis que você quer manter sobre o usuário logado
}

// Defina ou importe suas interfaces DTO
export interface LoginDto {
  email: string;
  password?: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
}