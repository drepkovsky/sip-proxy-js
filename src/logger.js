const fs = require("fs/promises");

class Logger {
  static TYPE_INVITE = "INVITE";
  static TYPE_BYE = "BYE";
  static TYPE_OK = "OK";
  static TYPE_CANCEL = "CANCEL";
  static TYPE_REJECT = "REJECT";

  constructor(path = "./log.txt") {
    this.path = path;
    this.invites = {};
    this.calls = {};
  }

  /**
   *
   * @param {{
   * type: string,
   * from: string,
   * to: string | string[],
   * }} logData
   */
  log = async (logData) => {
    if (
      ![
        Logger.TYPE_INVITE,
        Logger.TYPE_BYE,
        Logger.TYPE_OK,
        Logger.TYPE_CANCEL,
        Logger.TYPE_REJECT,
      ].includes(logData.type)
    )
      return;

    console.log(logData);

    // if (type === Logger.TYPE_INVITE) {
    //   this.invites[logData.from] = Array.isArray(logData.to)
    //     ? logData.to
    //     : [logData.to];
    // } else if (type === Logger.TYPE_ACCEPT) {
    //   // this.invites[logData.from] = logData.to;
    // } else if (
    //   [
    //     Logger.TYPE_BYE,
    //     Logger.TYPE_ACCEPT,
    //     Logger.TYPE_CANCEL,
    //     Logger.TYPE_REJECT,
    //   ].includes(logData.type)
    // ) {
    // }

    // await fs.appendFile(this.path);
  };

  _buildLog = (type, from, to, status, reason) => {
    const data = {
      type: type,
      from: from,
      to: to,
      status: status,
      reason: reason,
    };

    return ``;
  };
}

module.exports = Logger;
