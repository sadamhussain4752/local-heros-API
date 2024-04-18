// controllers/categoryController.js
const Category = require("../../models/Category/Category");
const {BASEURL} = require("../../utils/Constants")

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, isActive, createdBy, lang,order_by } = req.body;
    const imagePaths = req.files ? req.files.map(file => `${file.filename}`) : null;
    console.log(imagePaths);

    const newCategory = await Category.create({
      name,
      description,
      imageUrl: req.fileUrls[0],
      isActive,
      createdBy,
      lang,
      order_by
    });

    res.status(200).json({ success: true, category: newCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    categories.sort((a, b) => {
      // Convert the order_by field from string to number
      const orderA = parseFloat(a.order_by);
      const orderB = parseFloat(b.order_by);
    
      // Compare the numeric values
      return orderA - orderB;
    });   
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get a specific category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a specific category by ID
exports.updateCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description, isActive, createdBy, lang,order_by } = req.body;

    // Check if the category exists
    const existingCategory = await Category.findById(categoryId);

    if (!existingCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const imagePaths = req.files ? req.files.map(file => `${file.filename}`) : null;
    console.log(imagePaths);
    
    // Update the category fields
    existingCategory.name = name;
    existingCategory.isActive = isActive;
    existingCategory.description = description;
    existingCategory.imageUrl = req.fileUrls[0];
    existingCategory.createdBy = createdBy;
    existingCategory.lang = lang;
    existingCategory.order_by = order_by
    

    // Save the updated category
    const updatedCategory = await existingCategory.save();

    res.status(200).json({ success: true, category: updatedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a specific category by ID
exports.deleteCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check if the category exists
    const existingCategory = await Category.findById(categoryId);

    if (!existingCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Remove the category from the database
    await Category.deleteOne({ _id: categoryId });

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

