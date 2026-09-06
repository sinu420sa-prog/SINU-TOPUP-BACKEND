const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const orders = {};

const ADMIN_PASSWORD = "SINU1234";

const GOXTOP_BASE_URL = "https://goxtop.com";
const GOXTOP_API_KEY = process.env.GOXTOP_API_KEY;

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
  res.json({
    shop: "SINU TOPUP SHOP",
    status: "online",
    goxtop: GOXTOP_API_KEY ? "configured" : "missing"
  });
});

/* =========================
   GOXTOP DEBUG REQUEST
========================= */

async function goxtopRequest(path, options = {}) {
  if (!GOXTOP_API_KEY) {
    throw new Error("GOXTOP_API_KEY is missing");
  }

  const url = GOXTOP_BASE_URL + "/api.v.1" + path;

  const response = await fetch(url, {
    ...options,
    redirect: "manual",
    headers: {
      "x-api-key": GOXTOP_API_KEY,
      "Accept": "application/json",
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get("content-type");
  const location = response.headers.get("location");

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = text.substring(0, 1000);
  }

  return {
    requestedUrl: url,
    httpStatus: response.status,
    contentType,
    location,
    redirected: response.status >= 300 && response.status < 400,
    data
  };
}

/* =========================
   TEST GOXTOP GAMES
========================= */

app.get("/api/goxtop/games", async (req, res) => {
  try {
    const result = await goxtopRequest("/games");

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "GoXtop connection failed",
      error: error.message
    });
  }
});

/* =========================
   TEST GOXTOP PRODUCTS
========================= */

app.get("/api/goxtop/products/:gameCode", async (req, res) => {
  try {
    const gameCode = encodeURIComponent(req.params.gameCode);

    const result = await goxtopRequest(
      "/products/" + gameCode
    );

    res.json({
      success: true,
      gameCode: req.params.gameCode,
      ...result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "GoXtop connection failed",
      error: error.message
    });
  }
});

/* =========================
   CREATE ORDER
========================= */

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

/* =========================
   CHECK ORDER STATUS
========================= */

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

/* =========================
   ADMIN: GET ORDERS
========================= */

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

/* =========================
   ADMIN: UPDATE STATUS
========================= */

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

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("SINU TOPUP BACKEND RUNNING");
});
