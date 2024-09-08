// //ana ayza el function takhod parameter fa amalt return howa el yakhod req res next
import jwt from "jsonwebtoken";
import { asyncHnadler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/classError.js";
import usermodel from "../../db/models/user.model.js";
import { systemRoles } from "../utils/systemRoles.js";
// export const auth = (roles = []) => {
//   return async (req, res, next) => {
//     const { token } = req.headers;
//     if (!token) {
//       next(new AppError("token not found", 500));
//     }
//     //ayza afok el token w at2aked eno sah w ayza at2aked mn berare key eno ba3to sah
//     if (!token.startsWith("Bearer__")) {
//       return next(new AppError("Invalid token format", 400));
//     }
//     //hena bat2ked eno ba3t el berare key sah
//     //law get a3ml verify hay2oly invalid token ashan hayb3to bl berare key lazem afslhom 3an ba3d w y3ml verify ll token el asasy mn ghear berare fa ha split
//     //split hatrg3ly array el awel string fady then el token ashan byrg3 el ablo wel ba3do fa ana ayza el token fa ha3ml [1]
//     const newToken = token.split("Bearer__")[1];

//     //law ana okay berare sah bas mafesh token asln
//     if (!newToken) {
//       next(new AppError("token not found", 400));
//     }

//     //abl ma a3ml find lazem a check el awel ashan madwrsh ala fady
//     try {
//       const decoded = jwt.verify(newToken, process.env.signaturekey);

//       console.log(decoded);

//       if (!decoded?.email) {
//         return next(new AppError("Invalid payload", 400));
//       }

//       const user = await usermodel.findOne({ email: decoded.email });

//       if (!user) {
//         return next(new AppError("User not found", 500));
//       }

//       // if (parseInt(user.passwordchangedAt.getTime() / 1000) > decoded.iat) {
//       //   return next(new AppError("Token expired", 403));
//       // }

//       // Add the user object to the request for further middleware

//       req.user = user;
//       console.log("User Object in Middleware:", req.user);

//       next();
//     } catch (err) {
//       return next(new AppError("Invalid token👻", 401));
//     }
//   };
// };

export const auth = (roles = []) => {
  return async (req, res, next) => {
    console.log("Auth Middleware Called");

    const { token } = req.headers;
    if (!token) {
      return next(new AppError("Token not found", 401));
    }

    if (!token.startsWith("Bearer__")) {
      return next(new AppError("Invalid token format", 400));
    }

    const newToken = token.split("Bearer__")[1];
    if (!newToken) {
      return next(new AppError("Token not found", 400));
    }

    try {
      const decoded = jwt.verify(newToken, process.env.signaturekey);
      console.log("Decoded Token:", decoded);

      if (!decoded?.email && !decoded?.id) {
        console.log("Invalid payload");
        return next(new AppError("Invalid payload", 400));
      }

      const user = await usermodel.findOne({ email: decoded.email });
      if (!user) {
        return next(new AppError("User not found", 404));
      }
      //authorization***********
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Unauthorized role" });
      }

      //********** */
      req.user = user;

      // Check if the user has the required role
      // Check if the user has the required role
      if (roles.length && !roles.includes(user.role)) {
        return next(new AppError("Unauthorized role", 403));
      }

      next();
    } catch (err) {
      console.log("Token verification error:", err);
      return next(new AppError("Invalid token👻", 401));
    }
  };
};
