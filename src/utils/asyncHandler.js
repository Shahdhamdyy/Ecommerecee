export const asyncHnadler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      next(err);
    });
  };
};

export const globalErrorHnadler = (err, req, res, next) => {
  res
    .status(err.statusCode || 500)
    .json({ msg: "error", err: err.message, stack: err.stack });
  next();
};
