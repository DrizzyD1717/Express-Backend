import passport from "passport";
import { Strategy } from "passport-local";
import { mockUsers } from "../utils/constants.mjs";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = mockUsers.find((u) => u.id === id);
  done(null, user);
});

export default passport.use(
  new Strategy((username, password, done) => {
    // This is where you would normally query your database to find the user
    console.log(`Username: ${username}, Password: ${password}`);
    const findUser = mockUsers.find((u) => u.username === username);
    if (!findUser) {
      return done(null, false, { message: "Incorrect username." });
    }
    if (findUser.password !== password) {
      return done(null, false, { message: "Incorrect password." });
    }
    return done(null, findUser);
  }),
);
