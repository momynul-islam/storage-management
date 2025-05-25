const fs = require("fs");
const path = require("path");
const catchAsync = require("./catchAsync");

exports.deleteImage = catchAsync(async (filename, tag) => {
  if (!filename) return;

  const filepath = path.join(__dirname, "..", "Public", tag, filename);

  fs.unlink(filepath, (err) => {
    if (err) console.log(err);
  });
});
