import { db } from '../db';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  const email = 'admin@pspc.com';
  const senha = '123456';
  const nome = 'Administrador';
  const perfil = 'admin';
  const status = 'ativo';

  const userExists = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  if (userExists.rows.length > 0) {
    console.log('Usuário admin já existe.');
    process.exit(0);
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  await db.query(
    'INSERT INTO usuarios (nome, email, senha, perfil, status) VALUES ($1, $2, $3, $4, $5)',
    [nome, email, senhaHash, perfil, status]
  );
  console.log('Usuário admin criado com sucesso!');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Erro ao criar admin:', err);
  process.exit(1);
}); 