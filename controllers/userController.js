const path = require("path");
const multer = require("multer");

const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const { deleteImage } = require("../utils/deleteImage");

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "public", "user_profile_pictures"));
  },
  filename: function (req, file, cb) {
    file.filename = `user-${req.user.id}-${Date.now()}.jpg`;
    cb(null, file.filename);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) throw new AppError("No user found with that id.", 404);

  res.status(200).json({
    status: "success",
    user,
  });
});

// Do NOT update passwords with this!
exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) {
    if (req.user.photo != "default_user.jpg")
      deleteImage(req.user.photo, "user_profile_pictures");
    filteredBody.photo = req.file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
  });

  res.status(200).json({
    status: "success",
    user: updatedUser,
  });
});
