const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Temporary order storage
const orders = {};

// Admin password
const ADMIN_PASSWORD = "SINU1234";

app.get("/", (req, res) => {
  res.json({
    shop: "SINU TOPUP SHOP",
    status: "online"
  });
});

// ===============================
// CREATE ORDER
// ===============================
app.post("/api/order", (req, res) => {

  const {
    game,
    server,
    uid,
    packageName,
    price,
    payment
  } = req.body;

  if (!game || !uid || !packageName || !price || !payment) {

    return res.status(400).json({
      success: false,
      message: "সব তথ্য দিন"
    });

  }

  const orderId = "SINU-" + Date.now();

  orders[orderId] = {

    orderId,
    game,
    server,
    uid,
    package: packageName,
    price,
    payment,
    status: "PENDING",
    createdAt: new Date().toISOString()

  };

  res.json({

    success: true,
    orderId,
    status: "PENDING",
    message: "Order Created Successfully"

  });

});

// ===============================
// CHECK ORDER STATUS
// ===============================
app.get("/api/order/:orderId", (req, res) => {

  const orderId = req.params.orderId;

  const order = orders[orderId];

  if (!order) {

    return res.status(404).json({
      success: false,
      message: "Order পাওয়া যায়নি"
    });

  }

  res.json({

    success: true,
    order

  });

});

// ===============================
// ADMIN: GET ALL ORDERS
// ===============================
app.get("/api/admin/orders", (req, res) => {

  const password =
    req.headers["x-admin-password"];

  if (password !== ADMIN_PASSWORD) {

    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });

  }

  res.json({

    success: true,
    orders: Object.values(orders)

  });

});

// ===============================
// ADMIN: UPDATE ORDER STATUS
// ===============================
app.put("/api/admin/order/:orderId", (req, res) => {

  const password =
    req.headers["x-admin-password"];

  if (password !== ADMIN_PASSWORD) {

    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });

  }

  const orderId =
    req.params.orderId;

  const order =
    orders[orderId];

  if (!order) {

    return res.status(404).json({
      success: false,
      message: "Order পাওয়া যায়নি"
    });

  }

  const { status } = req.body;

  const allowedStatuses = [
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED"
  ];

  if (!allowedStatuses.includes(status)) {

    return res.status(400).json({
      success: false,
      message: "Invalid status"
    });

  }

  order.status = status;

  res.json({

    success: true,
    message: "Status updated successfully",
    order

  });

});

// ===============================
// SERVER
// ===============================
const PORT =
  process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    "SINU TOPUP BACKEND RUNNING"
  );

});
