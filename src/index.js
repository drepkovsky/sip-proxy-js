const proxy = require("sip/proxy");
const sip = require("sip");
const db = require("./db");

const PORT = 5060;
const ADDRESS = "192.168.1.80";
const PROXY = `${ADDRESS}:${PORT}`;

// HELPERS
const prepareRequest = (req) => {
  if (req.headers.contact && req.headers.contact.length > 0) {
    req.headers.contact[0].uri = `sip:${
      sip.parseUri(req.headers.contact[0].uri).user
    }@${PROXY}`;
  }
};

// HANDLERS
const handleRegister = (req) => {
  const user = sip.parseUri(req.headers.to.uri).user;
  const contact = req.headers.contact;
  db.add(user, contact);

  console.log(`User ${user} registered`);

  const res = sip.makeResponse(req, 200, "OK");
  proxy.send(res);
};

const handleRequest = (req) => {
  // retrieve contact from user
  const user = sip.parseUri(req.uri).user;

  console.log(`Looking for ${user}'s contact`);
  const contact = db.get(user);

  // validate if contact exists
  if (!contact || !Array.isArray(contact) || contact.length === 0) {
    console.log(`Contact not found for ${user}`);
    proxy.send(sip.makeResponse(req, 404, "Not Found"));
    return;
  }

  //prepare request for forwarding
  req.uri = contact[0].uri;
  prepareRequest(req);

  console.log(`Forwarding ${req.method} to ${req.uri}`);

  proxy.send(req, (res) => {
    res.headers.via.shift();
    console.log(
      `Received '${res.status}${res.reason ? " " + res.reason : ""}' from ${
        req.uri
      }`
    );

    if (res.status === 486) {
      res.reason = "Obsadene";
    }

    prepareRequest(res);
    proxy.send(res);
  });
};

// START
try {
  proxy.start({}, (req, flow, lol) => {
    console.log(flow, lol);
    console.log(`\nReceived ${req.method} from ${req.headers.from.uri}`);

    if (req.method === "REGISTER") {
      handleRegister(req);
    } else if (
      [
        "INVITE",
        "ACK",
        "CANCEL",
        "BYE",
        "NOTIFY",
        "REFER",
        "MESSAGE",
        "OPTIONS",
        "INFO",
        "SUBSCRIBE",
      ].includes(req.method)
    ) {
      handleRequest(req);
    } else {
      return proxy.send(sip.makeResponse(req, 401, "Method Not Allowed"));
    }
  });
  console.log("SIP proxy started");
} catch (e) {
  console.warn(e);
}
