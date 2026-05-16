import { Router } from "express";
import { body, validationResult, matchedData } from "express-validator";
import { mockProducts } from "../utils/constants.mjs";

const router = Router();

router.get("/api/products", (req, res) => {
  console.log(req.headers.cookies);
  console.log(req.cookies);
  if (req.cookies.hello && req.cookies.hello === "world") {
    return res.send(mockProducts);
  } else {
    return res
      .status(403)
      .send({ msg: "You are not authorized to view products." });
  }
});

router.post(
  "/api/products",
  body("name").isString().isLength({ min: 2, max: 100 }),
  body("price").isFloat({ gt: 0 }),
  (req, res) => {
    const data = matchedData(req);
    console.log(data);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const newProduct = {
      id: mockProducts.length + 1,
      ...data,
    };
    mockProducts.push(newProduct);
    res.status(201).send(newProduct);
  },
);

export default router;
