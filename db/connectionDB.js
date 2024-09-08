import mongoose from "mongoose";
const connectionDB = async () => {
  return await mongoose
    .connect(process.env.DB_URL_Online)
    .then(() => {
      console.log(process.env.DB_URL_Online);
    })
    .catch((err) => {
      console.log({ message: "fail to connect db", err });
    });
};
export default connectionDB;
