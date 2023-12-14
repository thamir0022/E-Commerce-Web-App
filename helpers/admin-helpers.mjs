import { admindetails } from "../config/connection.mjs"

const adminLogin = async (userId, password) => {
  const admin =await admindetails.findOne({userID: userId, password: password})
  return admin
}

export {adminLogin}