import express from "express";

import usersRouter from "./routes/users.mjs";
import productsRouter from "./routes/products.mjs";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser("helloworld"));
app.use(usersRouter);
app.use(productsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.cookie("hello", "world", { maxAge: 10000, signed: true });
  res.status(201).send({ message: "Hello, World!" });
});
