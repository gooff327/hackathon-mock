import shortid from "shortid";
import { createWriteStream, mkdir } from "fs";
import { PassThrough } from 'stream';
import * as fs from "fs";
import * as path from "path";

export class CloseExtender extends PassThrough {
  public _extra
  constructor(...extra) {
    super()
    this._extra = extra;
  }
  emit(ev, ...args) {
    if (ev === 'close') return super.emit(ev, ...this._extra, ...args);
    super.emit(ev, ...args);
  }
}

export  const formatDate = (stamp, format) => {
  return stamp
}

export const storeUpload = async ({ stream, filename }) => {
  const dir = '../file/images/'
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  const id = shortid.generate();
  const p = `${id}-${filename}`;

  // (createWriteStream) writes our file to the images directory
  return new Promise((resolve, reject) =>
      stream
          .pipe(createWriteStream(fs.realpathSync(dir) + p))
          .on("finish", () => resolve('/images/' + p))
          .on("error", (e) => reject(e))
  );
};
