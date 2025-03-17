import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Routes
import indexRoutes from "./routes/indexRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import authPageRoutes from "./routes/authPageRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // ✅ Needs to come before you use app!

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

// Routes registration order (single block)
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/cart", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/", authPageRoutes);
app.use("/", indexRoutes);
app.use("/api", apiRoutes);

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
