import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import indexRoutes from "./routes/index.js";
import cartRoutes from "./routes/cart.js";
import adminRoutes from "./routes/admin.js";
import apiRoutes from "./routes/api.js";
import checkoutRoutes from "./routes/checkout.js";

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({ secret: "secret-key", resave: false, saveUninitialized: true })
);
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes registration order
app.use("/", indexRoutes);
app.use("/cart", cartRoutes);
app.use("/admin", adminRoutes);
app.use("/api", apiRoutes);
app.use("/checkout", checkoutRoutes);

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
