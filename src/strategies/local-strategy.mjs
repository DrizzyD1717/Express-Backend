import passport from "passport";
import { Strategy } from "passport-local";
import { mockUsers } from "../utils/constants.mjs";
import { User } from "../mongoose/schema/user.mjs";
import { comparePassword } from "../utils/helpers.mjs";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id).exec();
  done(null, user);
});

export default passport.use(
  new Strategy(async (username, password, done) => {
    // This is where you would normally query your database to find the user
    console.log(`Username: ${username}, Password: ${password}`);
    const findUser = await User.findOne({ username }).exec();
    if (!findUser) {
      return done(null, false, { message: "Incorrect username." });
    }
    if (!comparePassword(password, findUser.password)) {
      return done(null, false, { message: "Incorrect password." });
    }
    return done(null, findUser);
  }),
);
