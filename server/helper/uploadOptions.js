const multer = require('multer');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'video/mp4': 'mp4' 
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('Invalid image type');

    if (isValid) {
      uploadError = null;
    }

    let uploadPath;

    switch (file.fieldname) {
      case 'product_img':
        uploadPath = 'public/uploads/singleImg';
        break;
      case 'product_gallery':
        uploadPath = 'public/uploads/gallery';
        break;
      case 'cat_img':
      case 'subcat_img':
      case 'subsubcat_img':
        uploadPath = 'public/uploads/category';
        break;
      case 'color_img':  
      case 'single_img':  
      case 'gallery_img':  
      case 'video':  
        uploadPath = 'public/uploads/variation';
        break;  
      default:
        uploadError = new Error('Unknown field');
    }

    cb(uploadError, uploadPath);
  },
  filename: (req, file, cb) => {  
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
}).fields([
  { name: 'product_img', maxCount: 1 },
  { name: 'product_gallery', maxCount: 10 },
  { name: 'cat_img', maxCount: 1 },
  { name: 'subcat_img', maxCount: 1 },
  { name: 'subsubcat_img', maxCount: 1 },
  { name: 'color_img', maxCount: 1 },
  { name: 'single_img', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'gallery_img', maxCount: 10 },
]);

module.exports = upload;
