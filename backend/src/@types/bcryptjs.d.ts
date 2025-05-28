declare module 'bcryptjs' {
  export function hash(s: string | Buffer, salt: string | number): Promise<string>;
  export function compare(s: string | Buffer, hash: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;
  export function getRounds(hash: string): number;
  export function hashSync(s: string | Buffer, salt: string | number): string;
  export function compareSync(s: string | Buffer, hash: string): boolean;
  export function genSaltSync(rounds?: number): string;
} 