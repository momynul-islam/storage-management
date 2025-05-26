const express = require("express");

const authController = require("../controllers/authController");
const fileController = require("../controllers/fileController");

const router = express.Router();

router.use(authController.protect);

router
  .route("/notes")
  .get(fileController.getAllNotes)
  .post(fileController.uploadFile, fileController.uploadNote);
router
  .route("/pdfs")
  .get(fileController.getAllPdfs)
  .post(fileController.uploadFile, fileController.uploadPdf);
router
  .route("/images")
  .get(fileController.getAllImages)
  .post(fileController.uploadFile, fileController.uploadImage);
router.get("/sizeSummary", fileController.getTotalSizesByType);
router
  .route("/:fileId")
  .post(fileController.duplicateFile)
  .patch(fileController.renameFile)
  .delete(fileController.deleteFile);

router.patch("/:fileId/toggleFavourite", fileController.toggleFavourite);
router.get("/favourites", fileController.getFavouriteFiles);

module.exports = router;
