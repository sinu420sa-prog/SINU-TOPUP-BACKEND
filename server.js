const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    shop: "SINU TOPUP SHOP",
    status: "online"
  });
});

app.post("/api/order", (req, res) => {

  const { game, uid, packageName, price } = req.body;

  if (!game || !uid || !packageName || !price) {
    return res.status(400).json({
      success: false,
      message: "সব তথ্য দিন"
    });
  }

  const orderId = "SINU-" + Date.now();

  res.json({
    success: true,
    orderId: orderId,
    status: "PENDING",
    game: game,
    uid: uid,
    package: packageName,
    price: price
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("SINU TOPUP BACKEND RUNNING");
});
