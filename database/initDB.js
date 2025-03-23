import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Seed Data Imports
import products from "../data/productSeedData.js";
import users from "../data/userSeedData.js";
import orders from "../data/orderSeedData.js";
import orderItems from "../data/orderItemSeedData.js";
import shippingAddresses from "../data/shippingAddressSeedData.js";

const dbPromise = open({
  filename: "./database/ecommerce.db",
  driver: sqlite3.Database,
});

async function init() {
  const db = await dbPromise;

  try {
    console.log("⚠️ Dropping existing tables...");

    // 🔸 Disable foreign key checks while dropping tables
    await db.exec(`PRAGMA foreign_keys = OFF;`);

    const tables = [
      "shipping_addresses",
      "order_items",
      "orders",
      "users",
      "product_stock",
      "products",
    ];

    for (const table of tables) {
      console.log(`🔸 Dropping table: ${table}`);
      await db.exec(`DROP TABLE IF EXISTS ${table};`);
    }

    // 🔸 Re-enable foreign key checks
    await db.exec(`PRAGMA foreign_keys = ON;`);

    console.log("✅ Creating tables...");

    // Products Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        type TEXT,
        price REAL NOT NULL,
        image TEXT
      );
    `);

    // Product Stock Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS product_stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        size TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products (id)
      );
    `);

    // Users Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    // Orders Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL,
        order_number TEXT UNIQUE NOT NULL,
        order_date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Order Items Table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        size TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      );
    `);

    // Shipping Addresses Table (✅ FIXED: Removed NOT NULL from order_id)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS shipping_addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        user_id INTEGER,
        full_name TEXT NOT NULL,
        street TEXT NOT NULL,
        address_line2 TEXT,
        city TEXT NOT NULL,
        postcode TEXT NOT NULL,
        country TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    console.log("✅ Tables created!");

    // Seed products and stock
    console.log("🌱 Seeding products...");
    for (const product of products) {
      const { name, description, category, type, price, image, stock } =
        product;

      const result = await db.run(
        `INSERT INTO products (name, description, category, type, price, image)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description, category, type, price, image]
      );

      const productId = result.lastID;

      for (const size in stock) {
        const quantity = stock[size];

        await db.run(
          `INSERT INTO product_stock (product_id, size, quantity)
           VALUES (?, ?, ?)`,
          [productId, size, quantity]
        );
      }
    }

    // Seed users
    console.log("🌱 Seeding users...");
    for (const user of users) {
      await db.run(
        `INSERT INTO users (id, name, email, password)
         VALUES (?, ?, ?, ?)`,
        [user.id, user.name, user.email, user.password]
      );
    }

    // Seed orders
    console.log("🌱 Seeding orders...");
    for (const order of orders) {
      await db.run(
        `INSERT INTO orders (user_id, total_amount, status, order_number, order_date)
         VALUES (?, ?, ?, ?, ?)`,
        [
          order.user_id,
          order.total_amount,
          order.status,
          order.order_number,
          order.order_date,
        ]
      );
    }

    // Seed order items
    console.log("🌱 Seeding order items...");
    for (const item of orderItems) {
      await db.run(
        `INSERT INTO order_items (order_id, product_id, size, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [item.order_id, item.product_id, item.size, item.quantity, item.price]
      );
    }

    // Seed shipping addresses
    console.log("🌱 Seeding shipping addresses...");
    for (const address of shippingAddresses) {
      await db.run(
        `INSERT INTO shipping_addresses 
          (order_id, user_id, full_name, street, address_line2, city, postcode, country, phone, email)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          address.order_id,
          address.user_id,
          address.full_name,
          address.street,
          address.address_line2 || "",
          address.city,
          address.postcode,
          address.country,
          address.phone || "",
          address.email || "",
        ]
      );
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  } finally {
    await db.close();
  }
}

init().catch((err) => console.error("❌ Error running init():", err));
