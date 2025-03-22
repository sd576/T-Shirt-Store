const setLocals = (req, res, next) => {
  const userInfo = req.session.userInfo || null;

  res.locals.user = userInfo;

  if (userInfo && userInfo.name) {
    res.locals.firstName = userInfo.name.split(" ")[0];
  } else {
    res.locals.firstName = null;
  }

  res.locals.cart = req.session.cart || [];

  console.log(
    `🟢 setLocals middleware → path: ${req.path} | firstName: ${res.locals.firstName}`
  );

  next();
};

export default setLocals;
