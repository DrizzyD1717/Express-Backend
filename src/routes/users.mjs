import { Router } from "express";
import {
  query,
  validationResult,
  checkSchema,
  matchedData,
} from "express-validator";
import { mockUsers } from "../utils/constants.mjs";
import { createuservalidationSchema } from "../utils/validationSchema.mjs";

const router = Router();

router.get(
  "/api/users",
  // query("filter").isString().notEmpty().isLength({ min: 3, max: 10 }),
  query("value").isString().notEmpty().isLength({ min: 3, max: 10 }),

  (req, res) => {
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

// app.use(loggedInMiddleware);

// The below function is used to create a new user. It validates the request body and adds the new user to the mockUsers array.
router.post(
  "/api/users",
  checkSchema(createuservalidationSchema),
  // [
  //   body("username")
  //     .notEmpty()
  //     .withMessage("Username is required")
  //     .isLength({ min: 5, max: 32 })
  //     .withMessage("Username must be between 5 and 32 characters")
  //     .isString()
  //     .withMessage("Username must be a string"),
  //   body("displayName").notEmpty().withMessage("Display name is required"),
  // ],
  (req, res) => {
    const result = validationResult(req);
    console.log(result);
    if (!result.isEmpty()) {
      return res.status(400).send({ errors: result.array() });
    }

    const data = matchedData(req);
    console.log(data);
    const newUser = { id: mockUsers.length + 1, ...data };
    mockUsers.push(newUser);

    return res.status(201).send(newUser);
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
