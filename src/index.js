const proxy = require("sip/proxy");
const sip = require("sip");
const Database = require("./database");
const Logger = require("./logger");

const ADDRESS = "192.168.100.7";
const PORT = 5060;
const PROXY = `${ADDRESS}:${PORT}`;

const db = new Database();
const logger = new Logger();

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

  proxy.send(sip.makeResponse(req, 200, "OK"));
};

const log = (req, _from, _to) => {
  const from = sip.parseUri(req.headers.from.uri).user || _from;
  const to = sip.parseUri(req.headers.to.uri).user || _to;

  const logData = {
    from,
    to,
  };

  if (req.method === "INVITE") {
    logData.type = Logger.TYPE_INVITE;
  } else if (req.method === "BYE") {
    logData.type = Logger.TYPE_BYE;
  } else if (req.method === "CANCEL") {
    logData.type = Logger.TYPE_CANCEL;
  } else if (req.status === 486 || req.status === 603) {
    logData.type = Logger.TYPE_REJECT;
  } else if (req.status === 200) {
    logData.type = Logger.TYPE_OK;
  }

  console.log(logData);

  logger.log(logData);

  return { from, to };
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

  const { from, to } = log(req);

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

    log(res, from, to);

    prepareRequest(res);
    proxy.send(res);
  });
};

// START
try {
  sip.start({}, (req) => {
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
      proxy.send(sip.makeResponse(req, 401, "Method Not Allowed"));
    }
  });
  console.log("SIP proxy started");
} catch (e) {
  console.warn(e);
}
