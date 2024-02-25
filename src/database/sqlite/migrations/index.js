const sqliteConnection = require("../../sqlite");
const createUsers = require("./createUsers");

async function migrationsRun() {
  const schemas = [createUsers].join("");

  sqliteConnection()
    .then((db) => db.exec(schemas))
    .catch(console.error("Error running migrations"));
}

module.exports = migrationsRun;
