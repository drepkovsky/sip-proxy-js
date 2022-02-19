function Database() {
  this.users = {};

  const addUser = (user) => {
    this.users[user.name] = user;
  };

  const getUser = (name) => {
    return this.users[name];
  };

  return {
    addUser,
    getUser,
  };
}

const db = new Database();

module.exports = db;
