import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Routes
import indexRoutes from "./routes/index.js";
import cartRoutes from "./routes/cart.js";
import adminRoutes from "./routes/admin.js";
import apiRoutes from "./routes/api.js";
import checkoutRoutes from "./routes/checkout.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({ secret: "secret-key", resave: false, saveUninitialized: true })
);
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes registration order
app.use("/api/auth", authRoutes); // API auth routes (register/login/logout)
app.use("/api/orders", orderRoutes); // API orders route (protected)
app.use("/", indexRoutes); // Home page & other public routes
app.use("/cart", cartRoutes); // Cart pages (likely EJS)
app.use("/checkout", checkoutRoutes); // Checkout pages (likely EJS)
app.use("/admin", adminRoutes); // Admin pages
app.use("/api", apiRoutes); // Other API routes (legacy/custom)

// 404 handler (for all unmatched routes)
app.use((req, res) => {
  console.log(`404 hit: ${req.originalUrl}`);
  res.status(404).render("404");
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at: http://localhost:${PORT}/`);
});
