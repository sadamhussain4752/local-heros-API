// controllers/Product.js
const Product = require("../../models/ProductModel/Product");
const {BASEURL} = require('../../utils/Constants')
// Create a new Product

const LANGID = {
  1: "IND",
  2: "JPN",
  3: "KOR",
  4: "AUS",
};

exports.createProduct = async (req, res) => {

  try {
      const {
        name,
        subname,
        description,
        amount,
        offeramount,
        color,
        weight,
        dimensions,
        sku,
        availability,
        isActive,
        createdBy,
        category,
        lang,
        qty,
        exta_add_item
      } = req.body;
      console.log(req.file,req.files);
      // Assuming "images" is a file field in the form
      const imagePaths = req.files ? req.files.map(file => `${file.filename}`) : null;

      const newProduct = await Product.create({
          name,
          description,
          amount,
          offeramount,
          subname,
          imageUrl: req.fileUrls[0],
          color,
          weight,
          dimensions,
          sku,
          availability,
          isActive,
          createdBy,
          category,
          brand_id: "",
          lang,
          qty,
          exta_add_item
      });

      res.status(200).json({ success: true, product: newProduct });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
  }
}

exports.getAllProducts = async (req, res) => {
  const { lang } = req.query;

  // Validate 'lang' parameter
  if (!lang || !LANGID[lang]) {
    return res.status(400).json({ success: false, error: "Invalid 'lang' parameter" });
  }
 
  try {
    const products = await Product.find({ lang: LANGID[lang] });

   

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};



// Get user-specific Products by language and search criteria
exports.getUserProducts = async (req, res) => {
  try {
    const { search } = req.query;
   

    const query = {
      isActive: true,  // Include only active products
      $or: [
        { name: { $regex: new RegExp(search, 'i') } },  // Case-insensitive search for name
        { description: { $regex: new RegExp(search, 'i') } },  // Case-insensitive search for description
      ],
    };
    const userProducts = await Product.find(query);

    res.status(200).json({ success: true, userProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


// Get a specific Product by ID
exports.getProductById = async (req, res) => {
  try {
    const ProductId = req.params.id;
    const Products = await Product.findById(ProductId);

    if (!Products) {
      return res
        .status(404)
        .json({ success: false, message: "Products not found" });
    }

    res.status(200).json({ success: true, Products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a specific Product by ID
exports.updateProductById = async (req, res) => {
    try {
      const ProductId = req.params.id;
      const {
        name,
        description,
        amount,
        offeramount,
        color,
        weight,
        dimensions,
        sku,
        availability,
        isActive,
        createdBy,
        category,
        lang,
        brand_id,
        qty,
        subname,
        exta_add_item
      } = req.body;
  
      // Check if the Product exists
      const existingProduct = await Product.findById(ProductId);
  
      if (!existingProduct) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      const imagePaths = req.files ? req.files.map(file => `${file.filename}`) : null;

      // Update the Product fields
      existingProduct.name = name;
      existingProduct.subname = subname;
      existingProduct.description = description;
      existingProduct.amount = amount;
      existingProduct.offeramount = offeramount;
      existingProduct.images = req.fileUrls[0];
      existingProduct.color = color;
      existingProduct.weight = weight;
      existingProduct.dimensions = dimensions;
      existingProduct.sku = sku;
      existingProduct.availability = availability;
      existingProduct.isActive = isActive;
      existingProduct.createdBy = createdBy;
      existingProduct.category = category;
      existingProduct.brand_id = brand_id;
      existingProduct.lang = lang;
      existingProduct.qty = qty;
      existingProduct.exta_add_item = exta_add_item;
  
      // Save the updated Product
      const updatedProduct = await existingProduct.save();
  
      res.status(200).json({ success: true, product: updatedProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };
  

// Delete a specific Product by ID
exports.deleteProductById = async (req, res) => {
  try {
    const ProductId = req.params.id;

    // Check if the Product exists
    const existingProduct = await Product.findById(ProductId);

    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Remove the Product from the database
    await Product.deleteOne({ _id: ProductId });

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
