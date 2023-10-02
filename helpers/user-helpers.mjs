import { userDetails } from '../config/connection.mjs';
import bcrypt from 'bcrypt';

let doSignup = async (userData) => {
  userData.password = await bcrypt.hash(userData.password, 10)
  try{
    await userDetails.create(userData);
  }catch(error){
    console.log('Error occured in insertion of user data ',error);
  }
}

const doLogin = async (userData) => {
  let response = { user: null, loginStatus: false};

  try {
    const user = await userDetails.findOne({ userName: userData.username });

    if (user) {
      const status = await bcrypt.compare(userData.password, user.password);

      if (status) {
        console.log('LogIn Success');
        response.user = user;
        response.loginStatus = true;
      } else {
        console.log('Incorrect Password!');
      }
    } else {
      console.log("User doesn't exist");
    }
  } catch (error) {
    console.error('Error during login:', error);
  }

  return response;
};


export { doSignup, doLogin}