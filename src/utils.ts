import dfnsFormat from 'date-fns/format'
import shortid from "shortid";
import { createWriteStream, mkdir } from "fs";
import { PassThrough } from 'stream';

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

export const storeUpload = async ({ stream, filename, mimetype }) => {
  console.log('upload')
  mkdir("images", { recursive: true }, (err) => {
    if (err) throw err;
  });

  const id = shortid.generate();
  const path = `images/${id}-${filename}`;

  // (createWriteStream) writes our file to the images directory
  return new Promise((resolve, reject) =>
      stream
          .pipe(createWriteStream(path))
          .on("finish", () => resolve(path))
          .on("error", reject)
  );
};
