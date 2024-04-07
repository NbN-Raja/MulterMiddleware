// First Inistalize the image using multer 
// Create a multer Middleware first 

const multer = require('multer');

const memoryStorage = multer.memoryStorage();

const maxSize = 1024 * 1024; // 1 MB

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true); 
    } else {
        cb(new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed.'), false); 
    }
};

const uploadConfig = {
    storage: memoryStorage,
    limits: { fileSize: maxSize }, 
    fileFilter: fileFilter 
};

const aboutusImage = multer(uploadConfig);



module.exports = { aboutusImage };

// ******************************************************************************************************


// Now create a image middleware to save the image to Folders
const processImage = async (file, folderName, imageName, outputFormat) => {
    try {
        if (!file) return null;

        // Generate a dynamic filename based on the folder name and other parameters
        const filename = `${folderName}-${imageName}-${new Date().toISOString().replace(/:/g, "-")}-${file.originalname}`;

        // Set the output path to the specified folder
        const outputPath = path.join(`./public/images/${folderName}`, filename);

        // Process the image and save it to the specified folder
        await sharp(file.buffer)
            .resize(500)
            .toFormat(outputFormat)
            .toFile(outputPath);

        // Return the path to the saved image
        return `/images/uploads/${filename}`;
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
};

module.exports= {processImage}

// *************************************************************************************************************

// Now In The route use 
const { ProductImage } = require('../middleware/multermiddleware.js');

const imageFields = [
    { name: "image_one", maxCount: 1 },
    { name: "image_two", maxCount: 1 },
    { name: "image_three", maxCount: 1 }
];

router.post('/product', ProductImage.fields(imageFields), productController.post);
// router.post('/product', ProductImage.single('image_one'), productController.post);

// ***************************************************************************************************************8

// In the controller use this to get for single images


let imageOnePath = null;
if (req.files && req.files.image_one) {
    imageOnePath = await processImage(req.files.image_one[0], 'product', 'image_one', 'jpeg');
}

// Process image_two if exists
let imageTwoPath = null;
if (req.files && req.files.image_two) {
    imageTwoPath = await processImage(req.files.image_two[0], 'product', 'image_two', 'jpeg');
}

// Process image_three if exists
let imageThreePath = null;
if (req.files && req.files.image_three) {
    imageThreePath = await processImage(req.files.image_three[0], 'product', 'image_three', 'jpeg');
}

// Construct the data object with image paths
const data = {
    productName: productName,
    price: price,
    name: name,
    image_one: imageOnePath,
    image_two: imageTwoPath,
    image_three: imageThreePath
};
