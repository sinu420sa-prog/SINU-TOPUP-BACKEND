const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// CONFIG
// ===============================

const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = "SINU1234";

const GOXTOP_API_KEY = process.env.GOXTOP_API_KEY;

const GOXTOP_BASE_URL = "https://goxtop.com/api.v.1";

const GOXTOP_CHECK_BASE_URL = "https://goxtop.com/api/check";

// Temporary order storage
const orders = {};

// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
  res.json({
    shop: "SINU TOPUP SHOP",
    status: "online",
    goxtop: GOXTOP_API_KEY ? "configured" : "missing"
  });
});

// ===============================
// GOXTOP REQUEST HELPER
// ===============================

async function goxtopRequest(url, options = {}) {
  if (!GOXTOP_API_KEY) {
    throw new Error("GOXTOP_API_KEY is missing");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "x-api-key": GOXTOP_API_KEY,
      "Accept": "application/json",
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get("content-type");
  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return {
    httpStatus: response.status,
    contentType,
    data
  };
}

// ===============================
// PLAYER NAME CHECK
// FREE FIRE BANGLADESH
// ===============================

app.get("/api/player-name", async (req, res) => {
  try {
    const uid = String(req.query.uid || "").trim();

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "UID দিন"
      });
    }

    // Basic UID validation
    if (!/^[0-9]+$/.test(uid)) {
      return res.status(400).json({
        success: false,
        message: "সঠিক Player UID দিন"
      });
    }

    if (uid.length < 5 || uid.length > 20) {
      return res.status(400).json({
        success: false,
        message: "সঠিক Player UID দিন"
      });
    }

    const url =
      GOXTOP_CHECK_BASE_URL +
      "/game-check?code=freefire_bd&characterId=" +
      encodeURIComponent(uid);

    const result = await goxtopRequest(url);

    console.log("GoXtop Player Check:", {
      uid,
      status: result.httpStatus,
      data: result.data
    });

    // GoXtop/API error
    if (result.httpStatus < 200 || result.httpStatus >= 300) {
      return res.status(result.httpStatus).json({
        success: false,
        message:
          result.data?.message ||
          result.data?.error ||
          "Player check failed",
        goxtop: result.data
      });
    }

    const data = result.data;

    // ===============================
    // TRY TO FIND PLAYER NAME
    // ===============================

    const playerName =
      data?.name ||
      data?.playerName ||
      data?.player_name ||
      data?.username ||
      data?.charname ||
      data?.characterName ||
      data?.character_name ||
      data?.data?.name ||
      data?.data?.playerName ||
      data?.data?.player_name ||
      data?.data?.username ||
      data?.data?.charname ||
      data?.data?.characterName ||
      data?.data?.character_name;

    // If GoXtop returns success but no recognizable name
    if (!playerName) {
      return res.status(502).json({
        success: false,
        message: "Player name পাওয়া যায়নি",
        goxtop: data
      });
    }

    return res.json({
      success: true,
      uid,
      playerName: String(playerName)
    });

  } catch (error) {
    console.error("Player Name Check Error:", error);

    return res.status(500).json({
      success: false,
      message: "GoXtop connection failed"
    });
  }
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
// ADMIN: UPDATE ORDER STATUS
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

app.listen(PORT, "0.0.0.0", () => {
  console.log("SINU TOPUP BACKEND RUNNING");
});
