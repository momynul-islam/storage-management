module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "Something went wrong!";

  return res.status(err.statusCode).json({
    status: "error",
    message: err.message,
  });
};
