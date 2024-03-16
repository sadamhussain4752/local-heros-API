// controllers/AddCartController.js
const BannerCard = require("../../models/BannerCard/BannerModel");
const Category = require("../../models/Category/Category");
const Brand = require("../../models/Brand/BrandModel");
const Product = require("../../models/ProductModel/Product");
const Faq = require("../../models/AddFaq/FaqModel")
const { BASEURL } = require("../../utils/Constants");

const LANGID = {
  1: "IND",
  2: "JPN",
  3: "KOR",
  4: "AUS",
};

// Create a new item in the banner
exports.createBannerItem = async (req, res) => {
  try {
    const { name, description, createdBy, lang } = req.body;

    if (!name || !description || !createdBy || !lang) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const newBanner = await BannerCard.create({
      name,
      description,
      imageUrl: req.fileUrls[0],
      createdBy,
      lang,
    });

    res.status(200).json({ success: true, banner: newBanner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update an item in the banner
exports.updateBannerItem = async (req, res) => {
  try {
    const bannerItemId = req.params.id;
    const { name, description, isActive, createdBy, lang } = req.body;

    if (!name || !description || !isActive || !createdBy || !lang) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }
    const imagePaths = req.files ? req.files.map(file => `${file.filename}`) : null;


    const existingBannerItem = await BannerCard.findByIdAndUpdate(
      bannerItemId,
      {
        name,
        description,
        isActive,
        createdBy,
      imageUrl: req.fileUrls[0],
        lang,
      },
      { new: true }
    );

    if (!existingBannerItem) {
      return res
        .status(404)
        .json({ success: false, message: "Banner item not found" });
    }

    res.status(200).json({ success: true, bannerItem: existingBannerItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete an item from the banner
exports.deleteBannerItem = async (req, res) => {
  try {
    const bannerItemId = req.params.id;

    const existingBannerItem = await BannerCard.findById(bannerItemId);

    if (!existingBannerItem) {
      return res
        .status(404)
        .json({ success: false, message: "Banner item not found" });
    }

    // Remove the banner item from the database
    await BannerCard.deleteOne({ _id: existingBannerItem._id });

    res
      .status(200)
      .json({ success: true, message: "Banner item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all banner items
exports.getAllBanners = async (req, res) => {
  try {
    const { lang } = req.query;

    // Validate 'lang' parameter
    if (!lang || !LANGID[lang]) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid 'lang' parameter" });
    }
    const banners = await BannerCard.find({ lang: LANGID[lang] });

    const Faqs = await Faq.find();

    const Categorys = await Category.find({ lang: LANGID[lang] });
    

    res.status(200).json({ success: true, banners, Faqs, Categorys });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
exports.getBannerslist = async (req, res) => {
  try {
    const { lang } = req.query;

    // Validate 'lang' parameter
    if (!lang || !LANGID[lang]) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid 'lang' parameter" });
    }

    
    const banners = await BannerCard.find({ lang: LANGID[lang] });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
// Get all banner product items

exports.getAllBannerbyproduct = async (req, res) => {
  try {
    const { lang } = req.query;

    // Validate 'lang' parameter
    if (!lang || !LANGID[lang]) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid 'lang' parameter" });
    }

    // Fetch categories and brands
    const Brands = await Brand.find({ lang: LANGID[lang] });

    // Fetch products for each brand asynchronously using Promise.all
    const productsPromises = Brands.map(async (brand) => {
      const products = await Product.find({
        lang: LANGID[lang],
        brand_id: brand._id,
      });
      return { brand, products };
    });

    const productList = await Promise.all(productsPromises);

    // Create a mapping of brands to products
  

    res.status(200).json({ success: true, productList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


// Get a specific banner item by ID
exports.getBannerById = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const banner = await BannerCard.findById(bannerId);

    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({ success: true, banner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
