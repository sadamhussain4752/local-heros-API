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
    const { userId, productId, quantity ,Options_item ,Combo_type} = req.body;
    const existingCartItem = await AddCart.findOne({ userId, productId });


    // Ensure that the quantity is a number
    const parsedQuantity = parseInt(quantity, 10);

    if (!isNaN(parsedQuantity) && existingCartItem) {
      // If it exists, update the quantity
      existingCartItem.quantity += parsedQuantity;
      await existingCartItem.save();
      res.status(200).json({ success: true, cartItem: existingCartItem });
    } else if (!isNaN(parsedQuantity)) {
      // If it doesn't exist, create a new cart item
      const newCartItem = await AddCart.create({
        userId,
        productId,
        quantity: parsedQuantity,
        Options_item,
        Combo_type

      });
      res.status(200).json({ success: true, cartItem: newCartItem });
    } else {
      // Handle the case where quantity is not a valid number
      res.status(400).json({ success: false, error: 'Invalid quantity' });
    }
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
      let Options_id = "";

      // Fetch product details for each add cart item
      const product = await Product.findById(item.productId);

      // Fetch options item details if it exists
      if (item.Options_item) {
        Options_id = await Product.findById(item.Options_item);
      }

      return { ...item._doc, product, Options_id }; // Combine add cart item, product, and options item details
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
    const { quantity, savelater } = req.body;

    const existingCartItem = await AddCart.findByIdAndUpdate(
      cartItemId,
      { quantity, savelater },
      { new: true }
    );
    if(quantity === "0"){
      await AddCart.deleteOne({ _id: cartItemId });
    }

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
