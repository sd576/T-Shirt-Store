import express from "express";
import session from "express-session";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import setLocals from "./middleware/setLocals.js";

// Load environment variables
dotenv.config();

// ===== SETUP __dirname =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CREATE EXPRESS APP =====
const app = express();

// ===== ROUTE IMPORTS =====
// Web routes
import indexRoutes from "./routes/indexRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import authPageRoutes from "./routes/authPageRoutes.js";

// API routes
import apiAuthRoutes from "./routes/apiAuthRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import apiCartRoutes from "./routes/apiCartRoutes.js";
import apiCheckoutRoutes from "./routes/apiCheckoutRoutes.js";

// ===== INIT FUNCTION WITH DB + SERVER STARTUP =====
const init = async () => {
  // Open SQLite connection
  const db = await open({
    filename: "./database/ecommerce.db",
    driver: sqlite3.Database,
  });

  // Attach DB to app locals
  app.locals.db = db;

  // ===== MIDDLEWARES =====
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(
    session({
      secret: "secret-key", // replace in production
      resave: false,
      saveUninitialized: true,
    })
  );

  app.use(setLocals);
  app.use(express.static(path.join(__dirname, "public")));

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  // ===== ROUTES REGISTRATION =====
  app.use("/api/auth", apiAuthRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api", apiRoutes);
  app.use("/api/cart", apiCartRoutes);
  app.use("/api/checkout", apiCheckoutRoutes);

  app.use("/cart", cartRoutes);
  app.use("/checkout", checkoutRoutes);
  app.use("/", authPageRoutes);
  app.use("/", indexRoutes);

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
};

// ===== CALL INIT FUNCTION =====
init();
