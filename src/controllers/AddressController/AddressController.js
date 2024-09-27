const Address = require("../../models/Address/AddressModel");
const axios = require("axios")


exports.createAddress = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      phone,
      companyName,
      street,
      city,
      state,
      pinCode,
      email,
      typeAddress,
      lat,
      lng,
    } = req.body;

    // Coordinates of Bangalore city center
    const bangaloreLat = 12.9716;
    const bangaloreLng = 77.5946;

    // Google Maps API URL with your key
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?key=AIzaSyBoMO9HVyopxwZ5XzMiF1Xs7DVy8SU7NqY&origin=${lat},${lng}&destination=${bangaloreLat},${bangaloreLng}`;
    
    // Make a request to the Google Maps Directions API
    const response = await axios.get(directionsUrl);


    // Check if the response contains valid data
    if (response.data && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      // Get the distance in kilometers (Google API returns meters, so divide by 1000)
      const distance = route.legs[0].distance.value / 1000;

      // Assuming the service area is within a 50 km radius of Bangalore
      if (distance > 50) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Currently, we do not provide services in this location",
          });
      }

      // Proceed with address creation if within Bangalore
      const newAddress = await Address.create({
        userId,
        fullName,
        phone,
        companyName,
        street,
        city,
        state,
        pinCode,
        email,
        typeAddress,
        lat,
        lng,
      });

      res.status(200).json({ success: true, address: newAddress });
    } else {
      res
        .status(400)
        .json({
          success: false,
          message: "Currently, we do not provide services in this location",
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all Address
exports.getAllAddress = async (req, res) => {
  try {
    const Addresslist = await Address.find();
    res.status(200).json({ success: true, Addresslist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all Address
exports.getByIdAddress = async (req, res) => {
  try {
    const userId = req.params.id;
    const Addresslist = await Address.find({ userId });
    res.status(200).json({ success: true, Addresslist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
// Update a specific address by ID
// Update a specific address by ID
exports.updateAddressById = async (req, res) => {
  try {
    const addressId = req.params.id;
    const {
      fullName,
      phone,
      companyName,
      street,
      city,
      state,
      pinCode,
      email,
      typeAddress,
      lat, // Adding latitude
      lng  // Adding longitude
    } = req.body;

    // Check if the address exists
    const existingAddress = await Address.findById(addressId);

    if (!existingAddress) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // Coordinates of Bangalore city center
    const bangaloreLat = 12.9716;
    const bangaloreLng = 77.5946;

    // Google Maps API URL with your key
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?key=AIzaSyBoMO9HVyopxwZ5XzMiF1Xs7DVy8SU7NqY&origin=${lat},${lng}&destination=${bangaloreLat},${bangaloreLng}`;

    // Make a request to the Google Maps Directions API
    const response = await axios.get(directionsUrl);

    // Check if the response contains valid data
    if (response.data && response.data.routes.length > 0) {
      const route = response.data.routes[0];

      // Get the distance in kilometers (Google API returns meters, so divide by 1000)
      const distance = route.legs[0].distance.value / 1000;

      // Assuming the service area is within a 50 km radius of Bangalore
      if (distance > 50) {
        return res.status(400).json({ success: false, message: 'Currently, we do not provide services in this location' });
      }

      // Update the address fields
      existingAddress.fullName = fullName;
      existingAddress.phone = phone;
      existingAddress.companyName = companyName;
      existingAddress.street = street;
      existingAddress.city = city;
      existingAddress.state = state;
      existingAddress.pinCode = pinCode;
      existingAddress.email = email;
      existingAddress.typeAddress = typeAddress;
      existingAddress.lat = lat; // Updating latitude
      existingAddress.lng = lng; // Updating longitude

      // Save the updated address
      const updatedAddress = await existingAddress.save();

      res.status(200).json({ success: true, address: updatedAddress });
    } else {
      res.status(400).json({ success: false, message: 'Currently, we do not provide services in this location' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a specific address by ID
exports.deleteAddressById = async (req, res) => {
  try {
    const addressId = req.params.id;

    // Check if the address exists
    const existingAddress = await Address.findById(addressId);

    if (!existingAddress) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }
    c;
    // Remove the address from the database
    await Address.deleteOne({ _id: addressId });

    res
      .status(200)
      .json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
