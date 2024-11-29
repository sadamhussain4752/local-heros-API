const Order = require("../../models/OrderModel/OrderModel");
const Product = require("../../models/ProductModel/Product");
const User = require("../../models/UserModel/User");
const Address = require("../../models/Address/AddressModel");
const moment = require("moment");
const axios = require("axios");

const EventEmitter = require("events");
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

const onMessageSend = (status, message) => {
  let result;

  switch (status) {
    case "Pending":
    case "Refunded":
    case "Returned":
      result = {
        Template_ID: "1607100000000308629",
        Template_Header: "LHEROS",
        Template_Content: `Your order is currently pending confirmation. Rest assured, we're processing it as quickly as possible. Estimated Waiting Time: ${message +" "+ status} Thank you for your patience -LOCAL HEROS`,
      };
      break;

    case "Processing":
    case "Cancelled":
    case "On Hold":
    case "Confirmed":
    case "Out for Delivery":
    case "Failed":
      result = {
        Template_ID: "1607100000000308626",
        Template_Header: "LHEROS",
        Template_Content: `Your order is confirmed. Special Instructions: ${message +" "+ status} -LOCAL HEROS`,
      };
      break;

    case "Shipped":
    case "Delivered":
    case "Preparing":
    case "Order Placed":
      result = {
        Template_ID: "1607100000000308628",
        Template_Header: "LHEROS",
        Template_Content: `Congratulations! Your order is confirmed. Estimated Delivery Time: ${message +" "+ status} Thank you for choosing Zomato! -LOCAL HEROS`,
      };
      break;

    case "Completed":
      result = {
        Template_ID: "1607100000000308629",
        Template_Header: "LHEROS",
        Template_Content: `Congratulations! Your order is confirmed. Estimated Delivery Time: ${message +" "+ status} Thank you for choosing Swiggy! -LOCAL HEROS`,
      };
      break;

    default:
      result = {
        Template_ID: "Unknown",
        Template_Header: "LHEROS",
        Template_Content: `We are unable to process your request at this time. Please contact support for assistance.`,
      };
      break;
  }
  console.log(result,status, message);
  
  return result;
};


const eventEmitter = new EventEmitter();

// Define the FCM server key
const serverKey =
  "AAAA2OuANNg:APA91bHhYI2KxWGRqm60dgGtrzbGYGAjKlTtU1K7_NEosNe8RR4RmeFzw9CYtGXnEToWcOQeCMnsqg27BY5FVkAC-qCMq6Fv1ic8yoJcPQiw1ew9oHgR2H_u7Za-jLykypzIAdN_b1Zu"; // Replace 'YOUR_SERVER_KEY' with your FCM server key

// Define the FCM endpoint
const fcmEndpoint = "https://fcm.googleapis.com/fcm/send";
const accountSid = "AC7293676e0655bebc9648970017499691";
const authToken = "fca7569062b1ad9069c81c1714e98383";
const client = new twilio(accountSid, authToken);
// Function to send SMS


const sendWhatsAppMessage = async (phoneNumber,verificationCode,Ordervalues) => {
  try {
      // Step 1: Call the OPT-IN API
      const optInUrl = `https://media.smsgupshup.com/GatewayAPI/rest?method=OPT_IN&format=json&userid=2000247171&password=9fBqPu7%23&phone_number=${phoneNumber}&v=1.1&auth_scheme=plain&channel=WHATSAPP`;
      const optInResponse = await axios.get(optInUrl);

      if (optInResponse.data.response.status === 'success') {
          console.log('Opt-In successful:', optInResponse.data.response.details);

          // Step 2: Call the message API
          const sendMessageUrl = `https://media.smsgupshup.com/GatewayAPI/rest?userid=2000247171&password=9fBqPu7%23&send_to=${phoneNumber}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Hi+%0A%0AThank+you+for+your+order.+Your+order+number+is+${verificationCode._id?.toString().slice(0, 8)  +" "+ Ordervalues}.%0A%0AEnjoy+your+Biryani&isTemplate=true&header=Order+confirmed`;
          const sendMessageResponse = await axios.get(sendMessageUrl);

          if (sendMessageResponse.data.response.status === 'success') {
              console.log('Message sent successfully:', sendMessageResponse.data);
          } else {
              console.error('Failed to send message:', sendMessageResponse.data.response.details);
          }
      } else {
          console.error('Opt-In failed:', optInResponse.data.response.details);
      }
  } catch (error) {
      console.error('Error occurred:', error.message);
  }
};
async function sendVerificationSMS(phoneNumber, msg,id) {
  const apiKey = "07a81cfd6463953ac8e5f3a9d43c1985";
  const sender = "LHEROS";

  const smsData = {
    key: apiKey,
    route: 2,
    sender: sender,
    number: phoneNumber,
    sms: id.Template_Content,
    templateid: id.Template_ID,
  };
  console.log(smsData);
  

  try {
    const response = await axios.get("http://site.ping4sms.com/api/smsapi", {
      params: smsData,
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
      from: "whatsapp:" + 14155238886,
      to: "whatsapp:" + to,
    });
    console.log("WhatsApp message sent successfully!");
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
};

// Function to send message
function sendMessage(user) {
  // Assume sending message logic here
  console.log(`Message sent to ${user.firstname} ${user.lastname}`);
}


const createOrderAPI = async (order_items) => {
  try {
    const address = await Address.findById(order_items.addressId);
    const userIdName = await User.findById(order_items.userId);
   
    const productPromises = order_items.quantity.map(async (productObj) => {
      const product = await Product.findById(productObj.productId);

      return {
        id: product.itemid,
        name: product.itemObject.itemname,
        gst_liability: "Restaurant",
        item_tax: [
          {
            id: "11213",
            name: "CGST",
            amount: (((product.amount / 1.05) * 2.5) / 100).toFixed(2),
          },
          {
            id: "20375",
            name: "SGST",
            amount: (((product.amount / 1.05) * 2.5) / 100).toFixed(2),
          },
        ],
        item_discount: "",
        price: product.amount.toString(),
        final_price: product.amount.toString(),
        quantity: productObj.quantity,
        description: "",
        variation_name: "",
        variation_id: "",
        AddonItem: {
          details: [],
        },
      };
    });

    const productsWithDetails = await Promise.all(productPromises);
    const tax_base = order_items.totalAmount / 1.05; // Base amount without tax
    const tax_rate = 2.5 / 100; // Tax rate percentage

    const tax_total = (tax_base * tax_rate * 2).toFixed(2); // Calculate tax and round to 2 decimal places
    const datas = JSON.stringify({
      app_key: "2syov4bft73azp1c9q6h0jnemw58dikg",
      app_secret: "726cd371fc246140ffa9e21c71a3510e4c7dd5cb",
      access_token: "3ed9af557f50c44359425b93fdb6335f6297b6f7",
      orderinfo: {
        OrderInfo: {
          Restaurant: {
            details: {
              res_name: "Local Heros Food Pvt Ltd",
              address:
                "40-533, 3rd Main Rd, Koramangala 8th Block, Koramangala, Bengaluru, Karnataka 560095",
              contact_information: "9164640969",
              restID: "r0ix95s4",
            },
          },
          Customer: {
            details: {
              email: userIdName?.email,
              name: userIdName?.firstname,
              address: address?.street,
              phone: address?.phone,
              latitude: address?.lat,
              longitude: address?.lng,
            },
          },
          Order: {
            details: {
              orderID: order_items._id,
              preorder_date: moment().format("YYYY-MM-DD"),
              preorder_time: moment().format("HH:mm:ss"),
              service_charge: "0",
              // sc_tax_amount: "0",
              delivery_charges: "0",
              // dc_tax_amount: "2.5",
              // dc_gst_details: [
              //   {
              //     gst_liable: "restaurant",
              //     amount: "0",
              //   },
              // ],
              packing_charges: "0",
              // pc_tax_amount: "1",
              // pc_gst_details: [
              //   {
              //     gst_liable: "restaurant",
              //     amount: "0",
              //   },
              // ],
              order_type: "H",
              ondc_bap: "buyerAppName",
              advanced_order: "N",
              payment_type: "CARD",
              table_no: "",
              no_of_persons: "1",

              discount_total: "",
              tax_total: tax_total,
              discount_type: "F",
              total: order_items.totalAmount.toString(),
              created_on: moment().format("YYYY-MM-DD HH:mm:ss"),
              enable_delivery: 1,
              min_prep_time: 30,
              callback_url: "https://localheros.in/",
              collect_cash: "0",
            },
          },
          OrderItem: {
            details: productsWithDetails,
          },
          Tax: {
            details: [
              {
                id: "11213",
                title: "CGST",
                type: "P",
                price: "2.5",
                tax: (((order_items.totalAmount / 1.05) * 2.5) / 100).toFixed(
                  2
                ),
                restaurant_liable_amt: (
                  ((order_items.totalAmount / 1.05) * 2.5) /
                  100
                ).toFixed(2),
              },
              {
                id: "20375",
                title: "SGST",
                type: "P",
                price: "2.5",
                tax: (((order_items.totalAmount / 1.05) * 2.5) / 100).toFixed(
                  2
                ),
                restaurant_liable_amt: (
                  ((order_items.totalAmount / 1.05) * 2.5) /
                  100
                ).toFixed(2),
              },
            ],
          },
          // Discount: {
          //   details: [
          //     {
          //       id: "362",
          //       title: "Discount",
          //       type: "F",
          //       price: "0",
          //     },
          //   ],
          // },
        },
        udid: "",
        device_type: "Web",
      },
    });
   
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://pponlineordercb.petpooja.com/save_order",
      headers: {
        "Content-Type": "application/json",
      },
      data: datas,
    };

    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));
    sendWhatsAppMessage(address.phone,order_items)

    return JSON.stringify(response.data);
  } catch (error) {
    return "Error creating order:", error;
    console.error("Error creating order:", error);
  }
};

const capturePayment = async (payment_id, amount) => {
  try {
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${payment_id}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            "rzp_live_ZTtFcdDX7OeqJJ:ZOHW4r4AAk3ELI6V0ebLDCKz"
          ).toString("base64")}`,
          // Replace 'your_api_key' and 'your_api_secret' with your actual Razorpay API key and secret
        },
        body: JSON.stringify({
          amount: amount * 100, // Amount in smallest currency unit (e.g., 100 for INR 1.00)
          currency: "INR",
        }),
      }
    );

    const data = await response.json();
    console.log("Payment captured:", data);
  } catch (error) {
    console.error("Error capturing payment:", error);
  }
};

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
      quantity,
    } = req.body;

    // Create a new order
    const newOrder = await Order.create({
      userId,
      addressId,
      productIds,
      totalAmount,
      paymentStatus,
      delivery,
      exta_add_item,
      exta_message,
      razorpay_payment_id,
      applycoupon,
      quantity,
    });

    const newProduct = await Product.findById(productIds[0]);

    try {
      await capturePayment(razorpay_payment_id, totalAmount);
    } catch (error) {
      console.error("Payment capture failed", error);
    }

    const users = await User.find({ UserType: "1" });
    const fcmTokenList = users
      .filter((user) => user.fcm_token)
      .map((user) => user.fcm_token);

    const message = {
      registration_ids: fcmTokenList,
      notification: {
        title: newProduct.name,
        body: `${newProduct.name} - ${newProduct.description}\nPayment Status: ${paymentStatus}\nAmount: ${totalAmount}`,
      },
    };

    try {
      await axios.post(fcmEndpoint, message, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${serverKey}`,
        },
      });
      console.log("Push notification sent successfully");
    } catch (error) {
      console.error("Error sending push notification", error);
    }

    await createOrderAPI(newOrder);

    res.status(200).json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Error creating order", error);
    res.status(500).json({ success: false, error: "Server error" });
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
eventEmitter.on("paymentCompleted", ({ userId, totalAmount }) => {
  // Perform admin notification here
  console.log(
    `Admin notified: User ${userId} completed a payment of ${totalAmount}`
  );
});

const onTrackOrder = async (trackId) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://staging.runnr.in/zgw/merchant/v1/order/track?order_id=${trackId}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "09064327-b592-4161-b92a-ac25495159c9",
    },
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error(`Error tracking order: ${error}`);
    return error;
    throw new Error("Error tracking order");
  }
};

const CancelTrackOrder = async (trackId) => {
  const data = JSON.stringify({
    order_id: trackId,
    reason: "CANCEL",
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://staging.runnr.in/zgw/merchant/v1/order/cancel",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "09064327-b592-4161-b92a-ac25495159c9",
    },
    data: data,
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

const CancelTrackOrders = async (trackId) => {
  let datas = JSON.stringify({
    app_key: "2syov4bft73azp1c9q6h0jnemw58dikg",
    app_secret: "726cd371fc246140ffa9e21c71a3510e4c7dd5cb",
    access_token: "3ed9af557f50c44359425b93fdb6335f6297b6f7",
    restID: "r0ix95s4",
    orderID: "",
    clientorderID: trackId,
    cancelReason: "Please cancel my order.",
    status: "-1",
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://pponlineordercb.petpooja.com/update_order_status",
    headers: {
      "Content-Type": "application/json",
    },
    data: datas,
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      return JSON.stringify(response.data)
    })
    .catch((error) => {
      console.log(error);
      return error
    });
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

    res.status(200).json({ success: true, orders: ordersWithDetails.reverse() });
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
    eventEmitter.emit("paymentCompleted", { userId, amount });

    res.status(200).json({ success: true, orderList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

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
      if (status === "Cancelled") {
        let track_order_list = await CancelTrackOrders(orderId);
        console.log(track_order_list,'track_order_list');
        existingOrder.exta_message = "Order status updated successfully"; // Assuming 'status' is the field you want to update
      }

      // Send SMS
      console.log(status,messageBody,existingOrder);
      
      let messageId =  onMessageSend(status,messageBody)
      console.log(messageId,"messageId");
      
      const address = await Address.findById(existingOrder.addressId);
       console.log(address);
       
      await sendVerificationSMS(address.phone, orderId,messageId);
      sendWhatsAppMessage(address.phone,existingOrder,status)
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
    console.log(orderId, "orderId");

    // Check if the Order exists
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Track the order
    const trackOrderList = await onTrackOrder(existingOrder.track_Order_id);

    res.status(200).json({
      success: true,
      message: "Order status retrieved successfully",
      response_message: trackOrderList,
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

    res.status(200).json({
      success: true,
      message: "Cancel Order successfully",
      responce_message: track_order_list,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
