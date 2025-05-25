const express = require('express');

const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);
router.get("/profile", userController.getUser);
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.updateUser
);

module.exports = router;