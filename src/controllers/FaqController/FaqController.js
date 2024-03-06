// controllers/FaqController.js
const Faq = require("../../models/AddFaq/FaqModel"); // Adjust the import path based on your project structure

// Create a new FAQ
exports.createFaq = async (req, res) => {
  try {
    const { name, description, isActive, createdBy, lang } = req.body;
    console.log(req.files, req.file);

    const imagePaths = req.files
      ? req.files.map((file) => `${file.filename}`)
      : null;

    const newFaq = await Faq.create({
      name,
      description,
      imageUrl: req.fileUrls[0],
      isActive,
      createdBy,
      lang,
    });

    res.status(200).json({ success: true, faq: newFaq }); // Change 'brand' to 'faq'
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update a FAQ by ID
exports.updateFaq = async (req, res) => {
  try {
    const faqId = req.params.id;
    const { name, description, createdBy, lang } = req.body;

    const imagePaths = req.files
      ? req.files.map((file) => `${file.filename}`)
      : null;

    // Check if the FAQ exists
    const existingFaq = await Faq.findById(faqId);

    if (!existingFaq) {
      return res
        .status(404)
        .json({ success: false, message: "FAQ not found" }); // Change 'brand' to 'faq'
    }

    // Update the FAQ fields
    existingFaq.name = name;
    existingFaq.description = description;
    existingFaq.imageUrl = req.fileUrls[0];
    existingFaq.createdBy = createdBy;
    existingFaq.lang = lang;

    // Save the updated FAQ
    const updatedFaq = await existingFaq.save();

    res.status(200).json({ success: true, faq: updatedFaq }); // Change 'brand' to 'faq'
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a FAQ by ID
exports.deleteFaq = async (req, res) => {
  try {
    const faqId = req.params.id;

    // Check if the FAQ exists
    const existingFaq = await Faq.findById(faqId);

    if (!existingFaq) {
      return res
        .status(404)
        .json({ success: false, message: "FAQ not found" }); // Change 'brand' to 'faq'
    }

    // Remove the FAQ from the database
    await Faq.deleteOne({ _id: faqId });

    res
      .status(200)
      .json({ success: true, message: "FAQ deleted successfully" }); // Change 'brand' to 'faq'
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
  
// Get all FAQs
exports.getAllFaqs = async (req, res) => {
  try {
   

    const faqs = await Faq.find();

    res.status(200).json({ success: true, faqs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get a specific FAQ by ID
exports.getFaqById = async (req, res) => {
  try {
    const faqId = req.params.id;
    const faq = await Faq.findById(faqId);

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    res.status(200).json({ success: true, faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
