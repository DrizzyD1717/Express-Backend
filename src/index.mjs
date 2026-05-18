import express from "express";

import usersRouter from "./routes/users.mjs";
import productsRouter from "./routes/products.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import { mockUsers } from "./utils/constants.mjs";
import passport from "passport";
import "./strategies/local-strategy.mjs";

const app = express();

app.use(express.json());
app.use(cookieParser("helloworld"));
app.use(
  session({
    secret: "helloworld",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000 * 60, // 1 hour
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use(usersRouter);
app.use(productsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  console.log(req.session);
  console.log(req.sessionID);
  req.session.visited = true;
  res.cookie("hello", "world", { maxAge: 10000, signed: true });
  res.status(201).send({ message: "Hello, World!" });
});

app.post("/api/auth", passport.authenticate("local"), (req, res) => {
  res.status(200).send(req.user);
});

app.post("/api/auth/logout", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ message: "You are not logged in." });
  }
  req.logout((err) => {
    if (err) {
      return res.status(500).send({ message: "Error logging out." });
    }
  });
  res.status(200).send({ message: "Logged out successfully." });
});

// app.post("/api/auth", (req, res) => {
//   const { username, password } = req.body;

//   const findUser = mockUsers.find(
//     (user) => user.username === username && user.password === password,
//   );
//   if (!findUser) {
//     return res.status(401).send({ error: "Invalid username or password" });
//   }
//   req.session.user = findUser;
//   return res.status(200).send(findUser);
// });

// app.get("/api/auth/status", (req, res) => {
//   return req.session.user
//     ? res.status(200).send(req.session.user)
//     : res.status(401).send({ error: "Not authenticated" });
// });

app.post("/api/cart", (req, res) => {
  if (!req.session.user) {
    return res.status(401).send({ error: "Not authenticated" });
  }
  const { body: item } = req;
  const { cart } = req.session;
  if (cart) {
    req.session.cart = [...cart, item];
  } else {
    req.session.cart = [item];
  }
  return res.status(201).send(item);
});
