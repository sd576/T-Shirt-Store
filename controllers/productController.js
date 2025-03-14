import dbPromise from "../database/db.js";

// Show Home Page (Product Listing)
export const showHomePage = async (req, res) => {
  try {
    const db = await dbPromise;
    const products = await db.all("SELECT * FROM products");

    const cart = req.session.cart || [];

    res.render("index", { products, cart });
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Show Single Product (Product Detail Page)
export const showProductDetail = async (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    return res.status(400).send("Invalid product ID");
  }

  try {
    const db = await dbPromise;

    const product = await db.get(
      "SELECT * FROM products WHERE id = ?",
      productId
    );
    if (!product) {
      return res.status(404).send("Product not found");
    }

    const stock = await db.all(
      "SELECT size, quantity FROM product_stock WHERE product_id = ?",
      productId
    );

    res.render("tShirt", { product, stock });
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    res.status(500).send("Internal Server Error");
  }
};
