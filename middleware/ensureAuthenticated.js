const ensureAuthenticated = (req, res, next) => {
  if (!req.session.token) {
    console.log("❌ Unauthorized access attempt. Redirecting to login.");
    return res.redirect("/login");
  }

  console.log("✅ User authenticated, proceeding.");
  next();
};

export default ensureAuthenticated;
