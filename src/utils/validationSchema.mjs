export const createuservalidationSchema = {
  username: {
    notEmpty: {
      errorMessage: "Username is required",
    },
    isLength: {
      options: { min: 5, max: 32 },
      errorMessage: "Username must be between 5 and 32 characters",
    },
    isString: {
      errorMessage: "Username must be a string",
    },
  },
  displayName: {
    notEmpty: {
      errorMessage: "Display name is required",
    },
  },
};
