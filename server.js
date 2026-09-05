const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    shop: "SINU TOPUP SHOP",
    status: "online"
  });
});

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

  res.json({
    success: true,
    orderId: orderId,
    status: "PENDING",
    game: game,
    server: server,
    uid: uid,
    package: packageName,
    price: price,
    payment: payment
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("SINU TOPUP BACKEND RUNNING");
});    price,
    payment
  } = req.body;

  if (!game || !uid || !packageName || !price || !payment) {
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
    server: server,
    uid: uid,
    package: packageName,
    price: price,
    payment: payment
  });

});


/* ==============================
   SERVER
============================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("SINU TOPUP BACKEND RUNNING");
});  "0.0.0.0",
  () => {

    console.log(
      "SINU TOPUP BACKEND RUNNING"
    );

  }
);
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("SINU TOPUP BACKEND RUNNING");
});
