export interface Papel {
    id: number;
    nome: string;
    permissoes: Permissao[];
}

export interface Permissao {
    id: number;
    codigo: string;
    descricao?: string;
}

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    senha: string;
    perfil: string;
    papeis: Papel[];
}

export interface UsuarioResponse {
    id: number;
    nome: string;
    email: string;
    papeis: Papel[];
} 