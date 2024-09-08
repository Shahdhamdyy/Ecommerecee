const dataMethod = ["body", "query", "params", "header", "file", "files"];

export const validation = (schema) => {
  return async (req, res, next) => {
    let arrayerror = [];

    dataMethod.forEach((key) => {
      if (schema[key]) {
        const { error } = schema[key].validate(req[key], { abortEarly: false });

        if (error) {
          // Ensure that error.details is defined
          if (error.details) {
            error.details.forEach((err) => {
              // Check if err.details is defined and has messages
              if (err && err.message) {
                arrayerror.push(err.message);
              }
            });
          } else {
            // Handle the case where error.details is undefined
            arrayerror.push("Validation error occurred.");
          }
        }
      }
    });

    if (arrayerror.length) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: arrayerror });
    }

    next();
  };
};
