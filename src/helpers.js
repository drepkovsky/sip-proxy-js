const getContact = (req) => req.headers.contact;
const getTo = (req) => req.headers.to;
const getFrom = (req) => req.headers.from;
const getMethod = (req) => req.method;
const getName = (uri) => uri.split("@")[0].split(":")[1];
const getCallId = (req) => req.headers["call-id"];
const buildRequest = (userTo, userFrom, callId) => ({
  uri: userTo.uri,
  headers: {
    to: { uri: userTo.uri },
    from: { uri: userFrom.uri },
    "call-id": callId,
    contact: userFrom.contact,
  },
});

module.exports = {
  getContact,
  getTo,
  getFrom,
  getMethod,
  getName,
  buildRequest,
  getCallId,
};
