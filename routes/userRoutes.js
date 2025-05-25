const express = require("express");

const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);
router.get("/profile", userController.getUser);
router.patch(
  "/updateProfile",
  userController.uploadUserPhoto,
  userController.updateUser
);

module.exports = router;
