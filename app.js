// app.js
import express from "express";
import session from "express-session";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import setLocals from "./middleware/setLocals.js";

// Load .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Web Routes
import indexRoutes from "./routes/indexRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import authPageRoutes from "./routes/authPageRoutes.js";

// Central API Router
import apiRoutes from "./routes/apiRoutes.js";

// DB and Server Init
const init = async () => {
  const db = await open({
    filename: "./database/ecommerce.db",
    driver: sqlite3.Database,
  });

  app.locals.db = db;

  // Middleware
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(
    session({
      secret: "secret-key", // Replace in production
      resave: false,
      saveUninitialized: true,
    })
  );
  app.use(setLocals);
  app.use(express.static(path.join(__dirname, "public")));

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  // ✅ API Routes
  app.use("/api", apiRoutes);

  // UI/Web Routes
  app.use("/cart", cartRoutes);
  app.use("/checkout", checkoutRoutes);
  app.use("/", authPageRoutes);
  app.use("/", indexRoutes);

  // 404 fallback
  app.use((req, res) => {
    console.log(`404 hit: ${req.originalUrl}`);
    res.status(404).render("404");
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  });
};

init();
