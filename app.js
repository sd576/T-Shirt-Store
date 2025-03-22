import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import setLocals from "./middleware/setLocals.js";

// Load environment variables
dotenv.config();

// ===== ROUTE IMPORTS =====
// Web routes
import indexRoutes from "./routes/indexRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import authPageRoutes from "./routes/authPageRoutes.js";

// API routes
import apiAuthRoutes from "./routes/apiAuthRoutes.js"; // NEW: API Auth Routes (JWT)
import orderRoutes from "./routes/orderRoutes.js"; // API Order Routes
import apiRoutes from "./routes/apiRoutes.js"; // Other APIs

// ===== SETUP __dirname =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CREATE EXPRESS APP =====
const app = express();

// ===== MIDDLEWARES =====

// Body parser middleware (handles form and JSON payloads)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session setup (must come before routes so session is available in them)
app.use(
  session({
    secret: "secret-key", // Replace with process.env.SESSION_SECRET in production
    resave: false,
    saveUninitialized: true,
  })
);

// ✅ res.locals.user middleware (after session, before routes)
app.use(setLocals);


// Static files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, "public")));

// EJS view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ===== ROUTES REGISTRATION =====

// ✅ API Routes (JSON + JWT) - APIs should come before Web routes
app.use("/api/auth", apiAuthRoutes); // API Login/Logout (JWT)
app.use("/api/orders", orderRoutes); // API Order routes (can be JWT protected later)
app.use("/api", apiRoutes); // Other APIs

// ✅ Web App Routes (EJS + sessions)
app.use("/cart", cartRoutes); // Cart pages (add/view cart)
app.use("/checkout", checkoutRoutes); // Checkout pages
app.use("/", authPageRoutes); // Login/Register/My Account (Web pages)
app.use("/", indexRoutes); // Home, product pages, etc.

// ===== 404 HANDLER =====
app.use((req, res) => {
  console.log(`404 hit: ${req.originalUrl}`);
  res.status(404).render("404");
});

// ===== START SERVER =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at: http://localhost:${PORT}/`);
});
