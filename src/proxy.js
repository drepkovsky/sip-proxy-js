const proxy = require("sip/proxy");
const sip = require("sip");
const {
  getContact,
  getMethod,
  getFrom,
  getTo,
  buildInvite,
  buildRequest,
} = require("./helpers");
const db = require("./db");
const User = require("./user");

const handleRegister = (req) => {
  const user = new User(getFrom(req), getContact(req));
  db.addUser(user);

  console.log(`REGISTERED user ${user.name}, ${user.uri}\n`);

  proxy.send(sip.makeResponse(req, 200, "OK"));
};

const handleInvite = (req) => {
  const name = getName(getTo(req));

  const userTo = db.getUser(name);

  if (!userTo)
    return proxy.send(sip.makeResponse(req, 480, "Temporarily Unavailable"));

  const userFrom = db.getUser(getName(getFrom(req).uri));

  // send invite to the user
  proxy.send(
    sip.makeResponse(
      buildRequest(userTo, userFrom, getCallId(req)),
      100,
      "Trying"
    )
  );

  proxy.send();
};

const handler = (req) => {
  console.log(`INCOMING REQUEST: ${getMethod(req)}, ${req.uri}`);

  switch (getMethod(req)) {
    case "REGISTER":
      return handleRegister(req);
    case "INVITE":
      return handleInvite(req);
    case "ACK":
      return handleAck(req);
    case "CANCEL":
      return handleCancel(req);
    case "BYE":
      return handleBye(req);
  }
};

const start = (adress) => {
  proxy.start(
    {
      address: adress,
    },
    handler
  );
  console.log("SIP PROXY STARTED AT", `${adress}:5060\n\n`);
};

module.exports = start;
