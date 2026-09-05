const express = require("express");
const cors = require("cors");

const app = express();

/* ==============================
   MIDDLEWARE
============================== */

app.use(cors());
app.use(express.json());


/* ==============================
   HOME / STATUS
============================== */

app.get("/", (req, res) => {

  res.json({
    shop: "SINU TOPUP SHOP",
    status: "online"
  });

});


/* ==============================
   CREATE ORDER
============================== */

app.post("/api/order", (req, res) => {

  const {
    game,
    server,
    uid,
    packageName,
    price,
    payment
  } = req.body;


  /* Validate order */

  if (
    !game ||
    !uid ||
    !packageName ||
    !price ||
    !payment
  ) {

    return res.status(400).json({

      success: false,

      message: "সব তথ্য দিন"

    });

  }


  /* Create unique Order ID */

  const orderId =
    "SINU-" + Date.now();


  /* Send order response */

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

const PORT =
  process.env.PORT || 3000;


app.listen(
  PORT,
  "0.0.0.0",
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
