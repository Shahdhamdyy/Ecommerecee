import multer from "multer";
import { AppError } from "../utils/classError.js";

export const validExtension = {
  image: ["image/jpeg", "image/jpg", "image/png"],
  pdf: ["application/pdf"],
  video: ["video/mp4", "video/mkv"],
};

export const multerHost = (customvalidation = ["image/png"]) => {
  //mams7tsh line el diskstorage ashan maykhznsh fl memory storage ashan ana ayza arf3ha ala server w sebtha ashan yrg3ly el destnation wfilename wpath ashan ady el path da llcloudinary law shelt el diskstorage hayrg3ly buffer
  const storage = multer.diskStorage({});

  const filefilter = function (req, file, cb) {
    if (customvalidation.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new AppError("file not supported"), false);
  };

  const upload = multer({ fileFilter: filefilter, storage });
  return upload;
};
