const path = require("path");
const multer = require("multer");
const fs = require("fs");

const File = require("../models/File");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let tag;

    const ext = path.extname(file.originalname).toLowerCase();

    if (ext === ".docx") tag = "notes";
    else if (ext === ".pdf") tag = "pdfs";
    else if ([".png", ".jpg", ".jpeg"].includes(ext)) tag = "images";
    else return cb(new AppError("Unsupported file type!", 400), false);

    cb(null, path.join(__dirname, "..", "public", tag));
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // file.filename = `${tag}-${req.user.id}-${Date.now()}.${ext}`;
    cb(null, `${file.originalname}`);
  },
});

const multerFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = [".docx", ".pdf", ".png", ".jpg", ".jpeg"];

  if (allowed.includes(ext)) cb(null, true);
  else
    cb(
      new AppError("Only .docx, .pdf, .png, .jpg, .jpeg allowed!", 400),
      false
    );
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadFile = upload.single("file");

exports.getAllNotes = catchAsync(async (req, res, next) => {
  const notes = await File.find({ type: "note" });
  console.log("notes", notes);

  res.status(200).json({
    status: "success",
    data: notes,
  });
});

exports.getNote = catchAsync(async (req, res, next) => {
  const note = await File.findById(req.params.noteId);

  if (!note) throw new AppError("No note found with this id", 404);

  res.status(200).json({
    status: "success",
    data: note,
  });
});

exports.uploadNote = catchAsync(async (req, res, next) => {
  if (!req.file) throw new AppError("No file found for upload!", 400);

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== ".docx") {
    throw new AppError("Only docx file are allowed in upload note.", 400);
  }

  const oldFile = await File.findOne({
    type: "note",
    name: req.file.originalname,
  });
  if (oldFile) {
    return res.status(200).json({
      status: "success",
      message: "A note already exist with same name!",
    });
  }

  const newNote = await File.create({
    name: req.file.filename,
    type: "note",
    path: req.file.path,
    size: req.file.size,
    owner: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: newNote,
  });
});

exports.getAllPdfs = catchAsync(async (req, res, next) => {
  const pdfs = await File.find({ type: "pdf" });

  res.status(200).json({
    status: "success",
    data: pdfs,
  });
});

exports.getPdf = catchAsync(async (req, res, next) => {
  const pdf = await File.findById(req.params.pdfId);

  if (!pdf) throw new AppError("No pdf found with this id", 404);

  res.status(200).json({
    status: "success",
    data: pdf,
  });
});

exports.uploadPdf = catchAsync(async (req, res, next) => {
  if (!req.file) throw new AppError("No file found for upload!", 400);

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== ".pdf") {
    throw new AppError("Only pdf file are allowed in upload pdf.", 400);
  }

  const oldFile = await File.findOne({
    type: "pdf",
    name: req.file.originalname,
  });
  if (oldFile) {
    return res.status(200).json({
      status: "success",
      message: "A pdf already exist with same name!",
    });
  }

  const newPdf = await File.create({
    name: req.file.filename,
    type: "pdf",
    path: req.file.path,
    size: req.file.size,
    owner: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: newPdf,
  });
});

exports.getAllImages = catchAsync(async (req, res, next) => {
  const images = await File.find({ type: "image" });

  res.status(200).json({
    status: "success",
    data: images,
  });
});

exports.getImage = catchAsync(async (req, res, next) => {
  const image = await File.findById(req.params.imageId);

  if (!image) throw new AppError("No image found with this id", 404);

  res.status(200).json({
    status: "success",
    data: image,
  });
});

exports.uploadImage = catchAsync(async (req, res, next) => {
  if (!req.file) throw new AppError("No file found for upload!", 400);

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) {
    throw new AppError(
      "Only png, jpg and jpeg files are allowed in upload image.",
      400
    );
  }

  const oldFile = await File.findOne({
    type: "image",
    name: req.file.originalname,
  });
  if (oldFile) {
    return res.status(200).json({
      status: "success",
      message: "An image already exist with same name!",
    });
  }

  const newImage = await File.create({
    name: req.file.filename,
    type: "image",
    path: req.file.path,
    size: req.file.size,
    owner: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: newImage,
  });
});

exports.getTotalSizesByType = catchAsync(async (req, res, next) => {
  const totals = await File.aggregate([
    {
      $match: { owner: mongoose.Types.ObjectId(req.user.id) },
    },
    {
      $group: {
        _id: "$type",
        totalSize: { $sum: "$size" },
      },
    },
  ]);

  const sizeSummary = { note: 0, image: 0, pdf: 0 };
  totals.forEach((item) => {
    sizeSummary[item._id] = item.totalSize;
  });

  res.status(200).json({
    status: "success",
    data: sizeSummary,
  });
});

exports.renameFile = catchAsync(async (req, res, next) => {
  const fileId = req.params.fileId;
  const newName = req.body.newName;

  if (!newName) throw new AppError("New name is required!", 400);

  const file = await File.findById(fileId);
  if (!file) throw new AppError("File not found!", 404);

  const ext = path.extname(file.name);
  const newFilename = `${newName}${ext}`;
  const newPath = path.join(path.dirname(file.path), newFilename);

  await fs.rename(file.path, newPath, (err) => {
    if (err) throw new AppError("Failed to rename the file on disk.", 500);
  });

  file.name = newFilename;
  file.path = newPath;
  await file.save();

  res.status(200).json({
    status: "success",
    data: file,
  });
});

exports.deleteFile = catchAsync(async (req, res, next) => {
  const fileId = req.params.fileId;

  const file = await File.findById(fileId);
  if (!file) throw new AppError("File not found!", 404);

  await fs.unlink(file.path, (err) => {
    if (err) throw new AppError("Failed to delete the physical file.", 500);
  });

  await File.findByIdAndDelete(fileId);

  res.status(200).json({
    status: "success",
    message: "File deleted successfully!",
  });
});

exports.toggleFavourite = catchAsync(async (req, res, next) => {
  const fileId = req.params.fileId;

  const file = await File.findById(fileId);
  if (!file) throw new AppError("File not found!", 404);

  file.isFavorite = !file.isFavorite;
  await file.save();

  res.status(200).json({
    status: "success",
    data: file,
  });
});

exports.getFavouriteFiles = catchAsync(async (req, res, next) => {
  const favouriteFiles = await File.find({ isFavorite: true });

  res.status(200).json({
    status: "success",
    data: favouriteFiles,
  });
});

exports.getFilesByDate = catchAsync(async (req, res, next) => {
  const { date } = req.body;

  if (!date) {
    throw new AppError(
      "Please provide a date in the request body (YYYY-MM-DD).",
      400
    );
  }

  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const files = await File.find({
    owner: req.user.id,
    uploadAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  res.status(200).json({
    status: "success",
    data: files,
  });
});

exports.duplicateFile = catchAsync(async (req, res, next) => {
  const originalFile = await File.findById(req.params.fileId);
  if (!originalFile) {
    throw new AppError("Original file not found!", 404);
  }

  const ext = path.extname(originalFile.name);
  const nameWithoutExt = path.basename(originalFile.path, ext);
  const newFileName = `${nameWithoutExt}-copy-${Date.now()}${ext}`;

  const newFilePath = path.join(path.dirname(originalFile.path), newFileName);

  fs.copyFileSync(originalFile.path, newFilePath);

  const duplicatedFile = await File.create({
    name: newFileName,
    type: originalFile.type,
    path: newFilePath,
    size: originalFile.size,
    owner: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: duplicatedFile,
  });
});
