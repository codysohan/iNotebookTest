const jwt = require("jsonwebtoken");
const JWT_SECRET = "sohanisahandsomeboy";

const fetchuser = (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      res.status(401).json({ error: "Please authenticate with valid token!" });
    } else if (token) {
      const data = jwt.verify(token, JWT_SECRET);
      req.user = data.user;
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: "Internal Server Error!" });
  }

  next();
};

module.exports = fetchuser;
