import jwt from "jsonwebtoken";
import { asyncHnadler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import { sendEmail } from "../../service/sendEmail.js";
import bcrypt from "bcrypt";
import usermodel from "../../../db/models/user.model.js";
import { customAlphabet } from "nanoid";

//********************************SingUp***************************************** */
export const signUp = asyncHnadler(async (req, res, next) => {
  const { name, email, password, age, phone, address,role } = req.body;

  const userExist = await usermodel.findOne({ email: email.toLowerCase() });
  //law user exist b true haydeny msg fl apperror
  userExist && next(new AppError("user already exist", 409));
  //creare token ashan ab3tlo confirm email
  // console.log(process.env.signaturekey); // Should print the JWT secret key
  // console.log(process.env.refreshsignaturekey); // Should print the refresh JWT secret key

  const token = jwt.sign({ email }, process.env.signaturekey, {
    expiresIn: '1h',
  });
  console.log(token);
  //send email
  const link = `${req.protocol}://${req.headers.host}/users/verifyEmail/${token}`;
  //refresh token
  const rftoken = jwt.sign({ email }, process.env.refreshsignaturekey, {
    expiresIn: 60*2,
  });
  
  //resend email
  const rflink = `${req.protocol}://${req.headers.host}/users/refreshtoken/${rftoken}`;

  // Send confirmation email with the token
  await sendEmail(
    email,
    "Confirm Your Email",
    `<a href="${link}">Click here to confirm your email</a><br><a href="${rflink}">Click here to resend the confirmation link</a>`
  );

  const hash = bcrypt.hashSync(password, +process.env.saltround);

  const user = new usermodel({
    name,
    email,
    password: hash,
    age,
    phone,
    address,
    role
  });
  //save user in db
  const newUser = await user.save();
  if (newUser) {
    res.status(201).json({ msg: "Sign-up successful", user: newUser });
  } else {
    next(new AppError("User not created", 500));
  }
});//********************************verifyEmail***************************************** */
export const verifyEmail = asyncHnadler(async (req, res, next) => {
  const { token } = req.params; // Extract token from URL parameters

  // Verify the token
  const decoded = jwt.verify(token, process.env.signaturekey);

  // If the decoded token does not contain an email, return an error
  if (!decoded?.email) {
    return next(new AppError("Invalid token", 400));
  }

  // Find the user and update their confirmation status
  const user = await usermodel.findOneAndUpdate(
    { email: decoded.email, confirmed: false },
    { confirmed: true }
  );

  // If the user is found and updated, respond with success
  if (user) {
    res.status(200).json({ msg: "Email successfully verified" });
  } else {
    // If no user is found, or the user is already confirmed, return an error
    return next(
      new AppError("User does not exist or is already confirmed", 400)
    );
  }
});

//********************************refreshtoken***************************************** */
export const refreshToken = asyncHnadler(async (req, res, next) => {
  const { rftoken } = req.params;
  const decoded = jwt.verify(rftoken, process.env.refreshsignaturekey);
  if (!decoded?.email) return next(new AppError("invalid token", 400));

  const user = await usermodel.findOne({
    email: decoded.email,
    confirmed: true,
  });
  if (user) {
    return next(new AppError("user already confirmed", 500));
  }
  const token = jwt.sign({ email: decoded.email }, process.env.signaturekey, {
    expiresIn:'1h',
  });
  //send email
  const link = `${req.protocol}://${req.headers.host}/users/verifyEmail/${token}`;
  await sendEmail(
    decoded.email,
    "confirm email",
    ` <a  href="${link}">click here</a>`
  );
  res.json({ msg: "done" });
});
//********************************forget password***************************************** */
export const forgetPassword = asyncHnadler(async (req, res, next) => {
  const { email } = req.body;
  const user = await usermodel.findOne({ email });
  if (!user) return next(new AppError("user does not exist", 400));

  const code = customAlphabet("0123456789", 5);// el rage3 mn hna function fa ana mhtaga el call bt3ha 
  const newCode = code();

  await sendEmail(
    email,
    "code for reset password",
    `<h1>your code ${newCode}</h1>`
  );
  await usermodel.updateOne({ email }, { code: newCode });
  res.json({ msg: "done" });
});
//********************************reset password***************************************** */
export const resetPassword = asyncHnadler(async (req, res, next) => {
  const { email, code, password } = req.body;
  const user = await usermodel.findOne({ email: email.toLowerCase() });
  if (!user) return next(new AppError("user does not exist", 400));
  if (user.code !== code) return next(new AppError("invalid code", 400));
  const saltRounds = parseInt(process.env.saltround, 10);
  const hash = bcrypt.hashSync(password, saltRounds);
  await usermodel.updateOne(
    { email },
    { password: hash, code: "", passwordchangedAt:Date.now()}
  );
  res.status(200).json({ msg: "done" });
});
//********************************SignIn***************************************** */
export const signin = asyncHnadler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await usermodel.findOne({
    email: email.toLowerCase(),
    confirmed: true,
  });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return next(new AppError("invalid email or password", 400));
  }
  const token = jwt.sign({ email, role: user.role }, process.env.signaturekey);
  await usermodel.updateOne({ email }, { loggedIn: true });
  res.json({ msg: "done", token });
});


