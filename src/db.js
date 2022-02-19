class Database {
  constructor() {
    this.registry = {};
  }

  add(username, contact) {
    this.registry[username] = contact;
  }

  get(username) {
    return this.registry[username];
  }

  remove(username) {
    delete this.registry[username];
  }
}

const db = new Database();

module.exports = db;
