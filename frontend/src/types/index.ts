export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Cliente {
  id: number;
  cpf: string;
  nome: string;
  telefone: string;
  status: string;
}

export interface Divida {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  status: string;
}

export interface ConsultaResult {
  cliente: Cliente | null;
  dividas: Divida[];
  data_consulta: string;
}

export interface Estatisticas {
  totalClientes: number;
  inadimplentes: number;
  consultasHoje: number;
} 