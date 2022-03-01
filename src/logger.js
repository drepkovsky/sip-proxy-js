const fs = require("fs/promises");

class Logger {
  static TYPE_INVITE = "INVITE";
  static TYPE_BYE = "BYE";
  static TYPE_OK = "OK";
  static TYPE_CANCEL = "CANCEL";
  static TYPE_REJECT = "REJECT";

  constructor(path = "./log.txt") {
    this.path = path;
    this.bufferMap = {};
  }

  _now() {
    return new Date().toLocaleString();
  }

  _hash(logData) {
    console.log(logData);
    const [from, to] = [logData.from, logData.to].sort();
    return `${from}-${to}`;
  }

  _addBuffer(logData, text) {
    const hash = this._hash(logData);
    if (!this.bufferMap[hash]) {
      if (logData.type !== Logger.TYPE_INVITE) return;
      this.bufferMap[hash] = [];
    }
    this.bufferMap[hash].push({ text, time: new Date(), type: logData.type });
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
    const { type } = logData;
    if (
      ![
        Logger.TYPE_INVITE,
        Logger.TYPE_CANCEL,
        Logger.TYPE_REJECT,
        Logger.TYPE_OK,
        Logger.TYPE_BYE,
      ].includes(logData.type)
    )
      return;

    if (type == Logger.TYPE_CANCEL) {
      this._addBuffer(
        logData,
        `${logData.from} CANCELED ${logData.to} at ${this._now()}`
      );
      return this._flushBuffer(logData);
    }
    if (type == Logger.TYPE_REJECT) {
      this._addBuffer(
        logData,
        `${logData.to} REJECTED ${logData.from} at ${this._now()}`
      );
      return this._flushBuffer(logData);
    }
    if (type === Logger.TYPE_BYE) {
      this._addBuffer(
        logData,
        `${logData.from} BYE ${
          logData.to
        } at ${this._now()}\nCall duration: ${this._getDuration(logData)} s`
      );
      return this._flushBuffer(logData);
    }
    if (type === Logger.TYPE_INVITE) {
      this._addBuffer(
        logData,
        `${logData.from} DIALED ${logData.to} at ${this._now()}`
      );
    } else if (type == Logger.TYPE_OK) {
      this._addBuffer(
        logData,
        `${logData.to} ACCEPTED ${logData.from} at ${this._now()}`
      );
    }
  };

  _flushBuffer = async (logData) => {
    const hash = this._hash(logData);
    if (!this.bufferMap[hash]) {
      return;
    }
    const buffer = this.bufferMap[hash];

    let text = `${logData.from} -> ${logData.to}\n`;

    text += buffer.map((item) => item.text).join("\n");

    text += "\n\n";

    await fs.appendFile(this.path, text);
    delete this.bufferMap[hash];
  };

  _getDuration = (logData) => {
    const buffer = this.bufferMap[this._hash(logData)];
    if (!buffer) return;
    const start = buffer.find((item) => item.type === Logger.TYPE_OK)?.time;
    if (!start) return;
    const end = new Date();
    return (end.getTime() - start.getTime()) / 1000;
  };
}

module.exports = Logger;
