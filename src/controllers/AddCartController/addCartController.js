// controllers/AddCartController.js
const AddCart = require('../../models/AddCart/AddCartModel');
const Product = require('../../models/ProductModel/Product');

const LANGID = {
    1: "IND",
    2: "JPN",
    3: "KOR",
    4: "AUS",
  };

// Create a new item in the cart
exports.createCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const newCartItem = await AddCart.create({
      userId,
      productId,
      quantity,
    });

    res.status(201).json({ success: true, cartItem: newCartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get all add cart for a specific user
exports.getAddcart = async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Fetch all add cart items for the user
      const AddCarts = await AddCart.find({ userId });
  
      // Create an array to store promises for fetching product details
      const productPromises = AddCarts.map(async (item) => {
        // Fetch product details for each add cart item
        const product = await Product.findById(item.productId);
        return { ...item._doc, product }; // Combine add cart item and product details
      });
  
      // Wait for all promises to resolve
      const AddCartsWithProducts = await Promise.all(productPromises);
  
      res.status(200).json({ success: true, AddCarts: AddCartsWithProducts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };
  
  
  

// Update quantity of an item in the cart
exports.updateCartItem = async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const { quantity,savelater } = req.body;

    const existingCartItem = await AddCart.findByIdAndUpdate(
      cartItemId,
      { quantity,savelater },
      { new: true }
    );

    if (!existingCartItem) {
      return res
        .status(404)
        .json({ success: false, message: 'Cart item not found' });
    }

    res.status(200).json({ success: true, cartItem: existingCartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete an item from the cart
exports.deleteCartItem = async (req, res) => {
  try {
    const cartItemId = req.params.id;

    const existingCartItem = await AddCart.findById(cartItemId);

    if (!existingCartItem) {
      return res
        .status(404)
        .json({ success: false, message: 'Cart item not found' });
    }

    // Remove the Coupon from the database
    await AddCart.deleteOne({ _id: existingCartItem });

    res.status(200).json({ success: true, message: 'Cart item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
