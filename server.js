const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// CONFIG
// ===============================

const GOXTOP_API_KEY = process.env.GOXTOP_API_KEY;
const GOXTOP_SECRET_KEY = process.env.GOXTOP_SECRET_KEY;

const GOXTOP_BASE_URL = "https://goxtop.com/api.v.1";

// Temporary order storage
const orders = {};

// Admin password
const ADMIN_PASSWORD = "SINU1234";

// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
  res.json({
    shop: "SINU TOPUP SHOP",
    status: "online",
    goxtop: GOXTOP_API_KEY ? "configured" : "not_configured"
  });
});

// ===============================
// GOXTOP BALANCE TEST
// ===============================

app.get("/api/goxtop/balance", async (req, res) => {
  try {
    if (!GOXTOP_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GOXTOP_API_KEY not configured"
      });
    }

    const response = await fetch(
      GOXTOP_BASE_URL + "/balance",
      {
        method: "GET",
        headers: {
          "x-api-key": GOXTOP_API_KEY,
          "Accept": "application/json"
        }
      }
    );

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    res.status(response.status).json({
      success: response.ok,
      httpStatus: response.status,
      data
    });

  } catch (error) {
    console.error("GoXtop balance error:", error);

    res.status(500).json({
      success: false,
      message: "GoXtop connection failed",
      error: error.message
    });
  }
});

// ===============================
// GOXTOP GAMES TEST
// ===============================

app.get("/api/goxtop/games", async (req, res) => {
  try {
    if (!GOXTOP_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GOXTOP_API_KEY not configured"
      });
    }

    const response = await fetch(
      GOXTOP_BASE_URL + "/games",
      {
        method: "GET",
        headers: {
          "x-api-key": GOXTOP_API_KEY,
          "Accept": "application/json"
        }
      }
    );

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    res.status(response.status).json({
      success: response.ok,
      httpStatus: response.status,
      data
    });

  } catch (error) {
    console.error("GoXtop games error:", error);

    res.status(500).json({
      success: false,
      message: "GoXtop connection failed",
      error: error.message
    });
  }
});

// ===============================
// GOXTOP PRODUCTS
// ===============================

app.get("/api/goxtop/products/:gameCode", async (req, res) => {
  try {
    if (!GOXTOP_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GOXTOP_API_KEY not configured"
      });
    }

    const gameCode = req.params.gameCode;

    const response = await fetch(
      GOXTOP_BASE_URL +
        "/products/" +
        encodeURIComponent(gameCode),
      {
        method: "GET",
        headers: {
          "x-api-key": GOXTOP_API_KEY,
          "Accept": "application/json"
        }
      }
    );

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    res.status(response.status).json({
      success: response.ok,
      httpStatus: response.status,
      data
    });

  } catch (error) {
    console.error("GoXtop products error:", error);

    res.status(500).json({
      success: false,
      message: "GoXtop connection failed",
      error: error.message
    });
  }
});

// ===============================
// CREATE SINU ORDER
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
// ADMIN GET ALL ORDERS
// ===============================

app.get("/api/admin/orders", (req, res) => {
  const password = req.headers["x-admin-password"];

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
// ADMIN UPDATE ORDER
// ===============================

app.put("/api/admin/order/:orderId", (req, res) => {
  const password = req.headers["x-admin-password"];

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  const orderId = req.params.orderId;
  const order = orders[orderId];

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
// START SERVER
// ===============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("SINU TOPUP BACKEND RUNNING");
});
