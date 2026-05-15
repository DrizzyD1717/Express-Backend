import express from "express";
import {
  query,
  validationResult,
  body,
  matchedData,
  checkSchema,
} from "express-validator";
import { createuservalidationSchema } from "./utils/validationSchema.mjs";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const mockUsers = [
  { id: 1, username: "Alice", displayName: "Alice Smith" },
  { id: 2, username: "Bob", displayName: "Bob Johnson" },
  { id: 3, username: "Charlie", displayName: "Charlie Brown" },
  { id: 4, username: "David", displayName: "David Wilson" },
  { id: 5, username: "Eve", displayName: "Eve Davis" },
  { id: 6, username: "Frank", displayName: "Frank Miller" },
  { id: 7, username: "Grace", displayName: "Grace Lee" },
];

const loggedInMiddleware = (req, res, next) => {
  // Example middleware logic - replace with actual authentication logic
  if (!req.headers.authorization) {
    return res.status(401).send({ error: "Unauthorized" });
  }
  next();
};

// The below function is used to handle the root route ("/") and sends a simple JSON response with a message.
app.get("/", (req, res) => {
  res.status(201).send({ message: "Hello, World!" });
});

// The below function is used to get a list of users. It supports optional query parameters for filtering the users based on specific fields.
app.get(
  "/api/users",
  // query("filter").isString().notEmpty().isLength({ min: 3, max: 10 }),

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

// The below function is used to get a single user by ID. It checks if the provided ID is a valid number and if a user with that ID exists in the mockUsers array.
app.get("/api/users/:id", (req, res) => {
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
app.post(
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
app.put("/api/users/:id", (req, res) => {
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
app.patch("/api/users/:id", (req, res) => {
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
app.delete("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).send({ error: "Invalid user ID" });
  const userIndex = mockUsers.findIndex((user) => user.id === id);
  if (userIndex === -1)
    return res.status(404).send({ error: "User not found" });
  mockUsers.splice(userIndex, 1);
  return res.status(200).send({ message: "User deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
