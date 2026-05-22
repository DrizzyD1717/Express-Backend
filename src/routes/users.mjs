import { Router } from "express";
import {
  query,
  validationResult,
  checkSchema,
  matchedData,
} from "express-validator";
import { mockUsers } from "../utils/constants.mjs";
import { createuservalidationSchema } from "../utils/validationSchema.mjs";
import { User } from "../mongoose/schema/user.mjs";
import { hashPassword } from "../utils/helpers.mjs";

const router = Router();

router.get(
  "/api/users",
  // query("filter").isString().notEmpty().isLength({ min: 3, max: 10 }),
  query("value").isString().notEmpty().isLength({ min: 3, max: 10 }),

  (req, res) => {
    req.sessionStore.get(req.session.id, (err, sessionData) => {
      if (err) {
        console.log(err);
        throw err;
      }
      console.log(sessionData);
    });
    const result = validationResult(req);
    const {
      query: { filter, value },
    } = req;

    if (!filter && !value) return res.send(mockUsers);

    if (filter && value)
      return res.send(
        mockUsers.filter((user) =>
          user[filter].toLowerCase().includes(value.toLowerCase()),
        ),
      );

    return res.status(400).send(mockUsers);
  },
);

// You can edit from here

router.get("/api/users/:id", (req, res) => {
  console.log(req.params);
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).send({ error: "Invalid user ID" });
  }

  const singleUser = mockUsers.find((user) => user.id === userId);
  if (!singleUser) {
    return res.status(404).send({ error: "User not found" });
  }
  res.status(201).send(singleUser);
});

// The below function is used to create a new user.
router.post(
  "/api/users",
  checkSchema(createuservalidationSchema),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ errors: result.array() });
    }

    const data = matchedData(req);
    console.log(data);
    data.password = await hashPassword(data.password);
    console.log(data);
    const newUser = new User(data);

    try {
      const savedUser = await newUser.save();
      res.status(201).send(savedUser);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  },
);

// The below function is used to update an existing user by ID. It checks if the provided ID is valid and if a user with that ID exists.
router.put("/api/users/:id", (req, res) => {
  const {
    body,
    params: { id },
  } = req;

  const parsedId = parseInt(id);
  if (isNaN(parsedId))
    return res.status(400).send({ error: "Invalid user ID" });
  const userIndex = mockUsers.findIndex((user) => user.id === parsedId);
  if (userIndex === -1) return res.status(404);

  mockUsers[userIndex] = { id: parsedId, ...body };
  return res.status(200).send(mockUsers[userIndex]);
});

// The below function is used to update an existing user. It checks if the provided ID is valid and if a user with that ID exists.
router.patch("/api/users/:id", (req, res) => {
  const {
    body,
    params: { id },
  } = req;

  const parsedId = parseInt(id);
  if (isNaN(parsedId))
    return res.status(400).send({ error: "Invalid user ID" });

  const userIndex = mockUsers.findIndex((user) => user.id === parsedId);
  if (userIndex === -1) return res.status(404);

  mockUsers[userIndex] = { ...mockUsers[userIndex], ...body };
  return res.status(200).send(mockUsers[userIndex]);
});

// The below function is used to delete a user by ID. It checks if the provided ID is valid and if a user with that ID exists.
router.delete("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).send({ error: "Invalid user ID" });
  const userIndex = mockUsers.findIndex((user) => user.id === id);
  if (userIndex === -1)
    return res.status(404).send({ error: "User not found" });
  mockUsers.splice(userIndex, 1);
  return res.status(200).send({ message: "User deleted successfully" });
});

export default router;
