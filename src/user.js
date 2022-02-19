const { getName } = require("./helpers");

class User {
  constructor(from, contact) {
    this.uri = from.uri.split(";")[0];
    this.name = getName(this.uri);
    this.contact = contact;
  }
}

module.exports = User;
