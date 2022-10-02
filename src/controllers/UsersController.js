const { hash, compare } = require('bcryptjs');
const sqliteConnection = require('../database/sqlite');
const AppError = require('../utils/AppError');

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    const database = await sqliteConnection();
    const checkUserExists = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    );
    if (checkUserExists) {
      throw new AppError('Este e-mail já está em uso');
    }

    const hashedPassword = await hash(password, 8);

    await database.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return response.status(201).json();
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body;
    const { id } = request.params;
    const database = await sqliteConnection();
    const user = await database.get('SELECT * FROM users WHERE id = (?)', [id]);
    if (!user) {
      throw new AppError('Usuário não encontrado');
    }
    const userWithUpdatedEmail = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    );
    // essa logica serve pra eu trocar o email só com o cara que tem o mesmo id
    // se eu to tentando atualizar meu email e o email que eu to tentando
    // cadastrar ja esta em uso por outro usuario
    // deve aparecer o erro ( este email ja esta em uso)
    // existe um email igual o que eu to tentando definir sendo que o id
    // do dono é diferente do meu significa que o email nao é meu
    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError('Este e-mail já esta em uso ');
    }

    if (password && !old_password) {
      throw new AppError('Você precisa informar a senha antiga');
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);
      if (!checkOldPassword) {
        throw new AppError('A senha antiga não confere');
      }
      user.password = await hash(password, 8);
    }

    // se existir conteudo dentro de nome
    // usa esse conteudo
    // se nao existir vai continuar o que ja estava la
    // isso serve porque as vezes o usuario quer alterar
    // apenas a senha
    // com isso eu nao perco os dados antigos que eu ja tinha
    // em name e email

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    await database.run(
      `UPDATE users SET
      name = ?,
      email = ?,
      password = ?,
      updated_at = DATETIME('now')
      WHERE id = ?`,
      [user.name, user.email, user.password, id]
    );
    return response.json();
  }
}

module.exports = UsersController;
