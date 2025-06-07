const Razorpay = require("razorpay");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: "rzp_test_kyvxGNN08b1Ugb",
  key_secret: "ZhkyCVOZ3HVcE8K20MC3I1c2",
});

app.post("/create-order", async (req, res) => {
  const options = {
    amount: req.body.amount * 100, // Convert to smallest currency unit (e.g., paise)
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
