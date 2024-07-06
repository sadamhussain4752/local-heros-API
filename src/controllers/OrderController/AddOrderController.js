const Order = require("../../models/OrderModel/OrderModel");
const Product = require("../../models/ProductModel/Product");
const User = require("../../models/UserModel/User");
const Address = require("../../models/Address/AddressModel");
const moment = require("moment");
const axios = require("axios");

const EventEmitter = require('events');
const twilio = require("twilio");




const PAYMENTSTATUS = {
  1: "Completed",
  2: "Pending",
};
const orderStatuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Refunded",
  "On Hold",
  "Completed",
  "Failed",
  "Returned",
  "Preparing",
  "Order Placed",
  "Confirmed",
  "Out for Delivery",
];
const eventEmitter = new EventEmitter();

// Define the FCM server key
const serverKey = 'AAAA2OuANNg:APA91bHhYI2KxWGRqm60dgGtrzbGYGAjKlTtU1K7_NEosNe8RR4RmeFzw9CYtGXnEToWcOQeCMnsqg27BY5FVkAC-qCMq6Fv1ic8yoJcPQiw1ew9oHgR2H_u7Za-jLykypzIAdN_b1Zu'; // Replace 'YOUR_SERVER_KEY' with your FCM server key

// Define the FCM endpoint
const fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';

const accountSid = "AC7293676e0655bebc9648970017499691";
const authToken = "fca7569062b1ad9069c81c1714e98383";
const client = new twilio(accountSid, authToken);
// Function to send SMS
async function sendVerificationSMS(phoneNumber,msg) {
  const apiKey = "07a81cfd6463953ac8e5f3a9d43c1985";
  const sender = "LHEROS";
  const templateId = "1607100000000307112";

  const smsData = {
    key: apiKey,
    route: 2,
    sender: sender,
    number: phoneNumber,
    sms: `Congratulations! Your order is confirmed. Estimated Delivery Time: ${msg} Thank you for choosing Swiggy! -LOCAL HEROS`,
    templateid: templateId
  };

  try {
    const response = await axios.get('http://site.ping4sms.com/api/smsapi', {
      params: smsData
    });

    // Assuming the response provides some confirmation of successful SMS delivery,
    // you can handle it here based on the structure of the response.
    console.log("SMS Sent Successfully:", response.data);

  } catch (error) {
    console.error("Error sending verification SMS:", error);
  }
}
// Function to send WhatsApp message
const sendWhatsApp = async (to, body) => {
  try {
    await client.messages.create({
      body: body,
      from: 'whatsapp:' + 14155238886,
      to: 'whatsapp:' + to
    });
    console.log('WhatsApp message sent successfully!');
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
};


// Function to send message
function sendMessage(user) {
  // Assume sending message logic here
  console.log(`Message sent to ${user.firstname} ${user.lastname}`);
}

// Function to check FCM token responsiveness
function checkFCMToken(user) {
  // Assume FCM token check logic here
  // For simplicity, let's assume it always returns true
  return true;
}

const createOrderAPI =  async(order_items) => {
  console.log("order_items",order_items);

  const address = await Address.findById(order_items.addressId);

  const productPromises = order_items.quantity.map(async (productIds) => {
    const product = await Product.findById(productIds.productId);
    return {
      "name": product.name,
      "weight": product.weight,
      "quantity": productIds.quantity,
      "price": product.amount
    };
  });

  let data = JSON.stringify({
    "order_id": `${order_items._id}`,
    "pickup_info": {
      "name": "local Heros",
      "phone_no": "9164640969",
      "full_address": {
        "address": "3rd Floor, 9th, A Main 559,9th A Main Rd, 1st Stage, Indiranagar,Bengaluru, Karnataka 560008",
        "location": {
          "latitude": 12.977638,
          "longitude": 77.638682
        },
        "landmark": ""
      }
    },
    "drop_info": {
      "name": address.fullName,
      "phone_no": address.phone,
      "full_address": {
        "address": address.typeAddress,
        "location": {
          "latitude": Number(address.lat),
          "longitude":Number(address.lng) 
        },
        "landmark": "Opposite"
      }
    },
    "order_value": order_items.totalAmount,
    "category": "FOOD",
    "amount_to_be_collected": 0,
    "order_items":productPromises,
    "preparation_time": 30,
    "enable_batching": true,
    "callback_url": "https://localheros.in/account",
    // "otp": {
    //   "pickup": "1234",
    //   "drop": "2345",
    //   "return": "3456"
    // },
    "instructions": {
      "drop": "Please leave order at the door"
    },
    "tag": "550e8400-e29b-41d4-a716-446655440000"
  });

  console.log(data,"data");
  
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://staging.runnr.in/zgw/merchant/v1/order/create',
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json', 
      'Authorization': '09064327-b592-4161-b92a-ac25495159c9'
    },
    data : data
  };
  
  axios.request(config)
  .then(async(response) => {
    console.log(JSON.stringify(response.data));
    // Check if the address exists
    const existingOrder = await Order.findById(order_items._id);

    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // Update the address fields
    existingOrder.track_Order_id = response.data.order_id;
    // Save the updated address
    const updatedAddress = await existingOrder.save();
    
  })
  .catch((error) => {
    console.log(error);
  });
  
} 

// Create a new order with payment
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      addressId,
      productIds,
      totalAmount,
      delivery,
      razorpay_payment_id,
      paymentStatus,
      exta_add_item,
      exta_message,
      applycoupon,
      quantity
    } = req.body;

    // Create a new order
    const newOrder = await Order.create({
      userId,
      addressId,
      productIds,
      totalAmount,
      paymentStatus, // You may adjust the initial payment status
      delivery,
      exta_add_item,
      exta_message,
      razorpay_payment_id,
      applycoupon,
      quantity
    });

    const newProduct = await Product.findById(productIds[0]);
    console.log(newProduct);
    const users = await User.find({ UserType: "1" });
    // Filter FCM tokens and create an array
    const fcmTokenList = users.filter(user => checkFCMToken(user)).map(user => user.fcm_token);
    console.log(fcmTokenList);
    // Prepare the push notification message
    const message = {
      registration_ids: fcmTokenList, // Use registration_ids instead of 'to' for multiple recipients
      notification: {
        title: newProduct.name,
        body: `${newProduct.name} - ${newProduct.description}\nPayment Status: ${paymentStatus}\nAmount: ${totalAmount}`,
      }
    };


    try {
      // Send the push notification
      axios.post(fcmEndpoint, message, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${serverKey}`,
        },
      })
        .then(response => {
          console.log('Push notification sent successfully:', response.data);
        })


      await createOrderAPI(newOrder)

      res.status(200).json({ success: true, order: newOrder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  } catch (error) {

  }

};
async function processPayment(userId, totalAmount) {
  return new Promise((resolve) => {
    // Simulate payment processing with a delay
    setTimeout(() => {
      console.log(`Payment processed for user ${userId} amount ${totalAmount}`);
      resolve();
    }, 1000);
  });
}





// Admin notification logic
eventEmitter.on('paymentCompleted', ({ userId, totalAmount }) => {
  // Perform admin notification here
  console.log(`Admin notified: User ${userId} completed a payment of ${totalAmount}`);
});


const onTrackOrder = async (trackId) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://staging.runnr.in/zgw/merchant/v1/order/track?order_id=${trackId}`,
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json', 
      'Authorization': '09064327-b592-4161-b92a-ac25495159c9'
    },
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error(`Error tracking order: ${error}`);
    return error;
    throw new Error('Error tracking order');
  }
};

const CancelTrackOrder = async (trackId) => {
  const data = JSON.stringify({
    "order_id": trackId,
    "reason": "CANCEL"
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://staging.runnr.in/zgw/merchant/v1/order/cancel',
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json', 
      'Authorization': '09064327-b592-4161-b92a-ac25495159c9'
    },
    data : data
  };

  try {
    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));
    return response.data; // Return the response data
  } catch (error) {
    return error; // Return the response data
    console.log(error);
    throw error; // Throw the error to be handled by the calling function
  }
};


exports.getAllOrder = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.query;

    // Create a dynamic filter based on status
    const filter = status
      ? { userId, paymentStatus: PAYMENTSTATUS[status] }
      : { userId };

    // Fetch all orders for the user
    const orderList = await Order.find(filter);

    // Create an array to store promises for fetching product details
    const orderPromises = orderList.map(async (order) => {
      // Fetch address details
      const address = await Address.findById(order.addressId);

      // Fetch user details
      const user = await User.findById(order.userId);

      // Fetch product details for each order item
      const productPromises = order?.quantity.map(async (prod) => {
        let Options_product = "";
        if (prod.Options_product_Id !== "") {
          Options_product = await Product.findById(prod.Options_product_Id);
        }
        const product = await Product.findById(prod.productId);
        return Options_product !== "" ? product : { Options_product, product };

      });

      // Wait for all promises to resolve
      const productsWithDetails = await Promise.all(productPromises);

      return { ...order._doc, address, user, products: productsWithDetails };
    });

    // Wait for all promises to resolve
    const ordersWithDetails = await Promise.all(orderPromises);

    res.status(200).json({ success: true, orders: ordersWithDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getAllOrderList = async (req, res) => {
  try {
    // Fetch all orders for the user
    const orderList = await Order.find();

    // Create an array to store promises for fetching product details
    const orderPromises = orderList.map(async (order) => {
      // Fetch address details
      const address = await Address.findById(order.addressId);

      // Fetch user details
      const user = await User.findById(order.userId);

      // Fetch product details for each order item
      const productPromises = order.productIds.map(async (productId) => {
        const product = await Product.findById(productId);
        return product;
      });

      // Wait for all promises to resolve
      const productsWithDetails = await Promise.all(productPromises);

      return { ...order._doc, address, user, products: productsWithDetails };
    });

    // Wait for all promises to resolve
    const ordersWithDetails = await Promise.all(orderPromises);

    res.status(200).json({ success: true, orders: ordersWithDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getpaymentlisten = async (req, res) => {

  const { userId, amount } = req.body;

  try {
    // Fetch all orders for the user
    // Process the payment asynchronously
    await processPayment(userId, amount);

    // Emit an event to notify the admin
    eventEmitter.emit('paymentCompleted', { userId, amount });


    res.status(200).json({ success: true, orderList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
}

// Update a specific order by ID
exports.updateOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, delivery } = req.body;

    // Check if the Order exists
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Update the Order fields]
    if (status) {
      existingOrder.paymentStatus = status; // Assuming 'status' is the field you want to update
      const messageBody = `Order has been Done: ${orderId.substring(0, 6)}`;

      // Send SMS
      await sendVerificationSMS("9629283625", orderId);

      // Send WhatsApp message
      // await sendWhatsApp("919629283625", messageBody);
    }
    if (delivery) {
      existingOrder.delivery = delivery; // Assuming 'status' is the field you want to update
    }

    // Save the updated Order
    const updatedOrder = await existingOrder.save();

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a specific order by ID
exports.deleteOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Check if the Order exists
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Remove the Order from the database
    await Order.deleteOne({ _id: orderId });

    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
exports.getAllDashboard = async (req, res) => {
  try {
    const { status } = req.query;

    // Get current date
    const currentDate = moment();
    const filter = {};

    // Calculate counts and total amount for different time periods
    const today_order = await calculateOrderStats({
      ...filter,
      createdAt: {
        $gte: currentDate.startOf("day").toDate(),
        $lt: currentDate.endOf("day").toDate(),
      },
    });
    const yesterday_order = await calculateOrderStats({
      ...filter,
      createdAt: {
        $gte: currentDate.subtract(1, "days").startOf("day").toDate(),
        $lt: currentDate.subtract(1, "days").endOf("day").toDate(),
      },
    });
    const months_order = await calculateOrderStats({
      ...filter,
      createdAt: {
        $gte: currentDate.startOf("month").toDate(),
        $lt: currentDate.endOf("month").toDate(),
      },
    });
    const yearly_order = await calculateOrderStats({
      ...filter,
      createdAt: {
        $gte: currentDate.startOf("year").toDate(),
        $lt: currentDate.endOf("year").toDate(),
      },
    });
    const total_order = await calculateOrderStats({
      ...filter,
      createdAt: {
        $gte: currentDate.startOf("year").toDate(),
        $lt: currentDate.endOf("year").toDate(),
      },
    });

    // Weekly sales amounts for the current year
    // const chartWeek = {};

    // Get all orders for the current year
    const yearlyOrders = await Order.find({
      ...filter,
      createdAt: {
        $gte: currentDate.startOf("year").toDate(),
        $lt: currentDate.endOf("year").toDate(),
      },
    });

    // // Calculate weekly sales amounts for the current year
    // for (let i = 0; i < 52; i++) {
    //     const weekOrders = yearlyOrders.filter(order => moment(order.createdAt).isoWeek() === i);
    //     const weeklyAmount = weekOrders.reduce((total, order) => total + order.totalAmount, 0);
    //     chartWeek[`week${i + 1}`] = weeklyAmount;
    // }

    // Monthly sales amounts for each year
    const chartYears = {};

    // Calculate monthly sales amounts for the current year
    for (let i = 0; i < 12; i++) {
      const monthOrders = yearlyOrders.filter(
        (order) => moment(order.createdAt).month() === i
      );
      const monthlyAmount = monthOrders.reduce(
        (total, order) => total + order.totalAmount,
        0
      );
      chartYears[moment.months(i).toLowerCase()] = monthlyAmount;
    }

    // Sales counts for different order statuses
    const sales = {};

    for (const status of orderStatuses) {
      sales[`${status.toLowerCase()}_order`] = await Order.countDocuments({
        ...filter,
        paymentStatus: status,
      });
    }

    // Last 7 days sales amounts
    const last7DaysAmount = {};
    for (let i = 6; i >= 0; i--) {
      const day = moment().subtract(i, "days").format("ddd").toLowerCase();
      const dayOrders = yearlyOrders.filter((order) =>
        moment(order.createdAt).isSame(moment().subtract(i, "days"), "day")
      );
      const dayAmount = dayOrders.reduce(
        (total, order) => total + order.totalAmount,
        0
      );
      last7DaysAmount[day] = dayAmount;
    }

    res.status(200).json({
      success: true,
      orders: {
        today_order,
        yesterday_order,
        months_order,
        yearly_order,
        total_order,
      },
      sales,
      chartYears,
      // chartWeek,
      last7DaysAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Create a new order with payment
exports.createOrderWithRazorpay = async (req, res) => {
  try {
    const { amount } = req.body;

    // Prepare data for Razorpay API
    const razorpayData = {
      amount: amount * 100, // Convert totalAmount to paise
      currency: "INR",
      receipt: `Order_1112`, // You may adjust the receipt format
      notes: {
        order_id: "Tea, Earl Grey, Hot value",
        // Add other necessary notes as needed
      },
    };

    // Make a request to Razorpay API to create an order
    const razorpayResponse = await axios.post(
      "https://api.razorpay.com/v1/orders",
      razorpayData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            "rzp_live_ZTtFcdDX7OeqJJ:ZOHW4r4AAk3ELI6V0ebLDCKz"
          ).toString("base64")}`,
          // Replace 'your_api_key' and 'your_api_secret' with your actual Razorpay API key and secret
        },
      }
    );

    // Extract the Razorpay order ID from the response
    const razorpayOrderId = razorpayResponse.data;

    // Update your order in the database with the Razorpay order ID

    // Send the Razorpay order ID in the response
    res.status(200).json({ success: true, razorpayOrderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

async function calculateOrderStats(filters) {
  const orderList = await Order.find(filters);

  // Filter orders based on payment method
  const cardOrders = orderList.filter((order) => order.delivery === "Card");
  const cashOrders = orderList.filter((order) => order.delivery === "Cash");

  const orderStats = {
    order_count: orderList.length,
    total_amount: orderList.reduce(
      (total, order) => total + order.totalAmount,
      0
    ),
    total_order_card: cardOrders.length,
    total_order_cash: cashOrders.length,
    total_amount_card: cardOrders.reduce(
      (total, order) => total + order.totalAmount,
      0
    ),
    total_amount_cash: cashOrders.reduce(
      (total, order) => total + order.totalAmount,
      0
    ),
  };

  return orderStats;
}


// Get the status of a specific order by ID
exports.OrderStatusById = async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log(orderId,"orderId");

    // Check if the Order exists
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Track the order
    const trackOrderList = await onTrackOrder(existingOrder.track_Order_id);

    res.status(200).json({
      success: true,
      message: "Order status retrieved successfully",
      response_message: trackOrderList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete a specific order by ID
exports.CancelOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { order_id } = req.body;


    // Check if the Order exists
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
   

    // Remove the Order from the database
    let track_order_list = await CancelTrackOrder(existingOrder.track_Order_id);

    res
      .status(200)
      .json({ success: true, message: "Cancel Order successfully", responce_message: track_order_list });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

