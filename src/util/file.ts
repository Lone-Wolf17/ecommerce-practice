import fs from "fs";

export const deleteFile = (filePath: string): void => {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
};
