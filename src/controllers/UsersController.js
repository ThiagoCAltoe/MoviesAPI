const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

const sqliteConnection = require("../database/sqlite");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    const db = await sqliteConnection();
    const checkUserExists = await db.get(
      "SELECT * FROM users WHERE email = (?)",
      [email]
    );
    if (checkUserExists) {
      throw new AppError("Email already exists", 400);
    }

    const hashedPassword = await hash(password, 8);

    await db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ]);

    return response.status(201).json();
  }
  async update(request, response) {
    const { name, email, password, old_password } = request.body;
    const { id } = request.params;

    const db = await sqliteConnection();
    const user = await db.get("SELECT * FROM users WHERE id = (?)", [id]);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const userWithUpdatedEmail = await db.get(
      "SELECT * FROM users WHERE email = (?)",
      [email]
    );

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Email already exists", 400);
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !old_password) {
      throw new AppError("Old password is required", 400);
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);
      if (!checkOldPassword) {
        throw new AppError("Old password does not match", 400);
      }

      // Verificar se a nova senha é igual à antiga
      const checkNewPassword = await compare(password, user.password);
      if (checkNewPassword) {
        throw new AppError("New password is the same as the old password", 400);
      }

      user.password = await hash(password, 8);
    }

    await db.run(
      "UPDATE users SET name = (?), email = (?),password = (?), updated_at = DATETIME('now') WHERE id = (?)",
      [user.name, user.email, user.password, id]
    );

    return response.status(204).json();
  }
}

module.exports = UsersController;
