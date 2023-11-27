const express = require("express");
const User = require("../models/User.js");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middlewere/fetchuser.js");

const JWT_SECRET = "sohanisahandsomeboy";
// Route 1: Creating the user, No login required, POST api/auth/createuser.
router.post(
  "/createuser",
  [
    // Initializing the type of email, name and type and also giving them error message
    body("email", "Please type a valid Email").isEmail(),
    body("name", "Please type a name with a minimum length of 3")
      .trim()
      .isLength({ min: 3 }),
    body(
      "password",
      "Please type a password with a minimum length of 8"
    ).isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    let signupSuccess = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Validation errors
      return res.status(400).json({ errors: errors.array() });
    }

    // If try doesn't run the catch(error) will be sent
    try {
      // Using Bcryptjs for hashing the password
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Check whether the user with the same email exists already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          emailExists: true,
          error: `Sorry user with this ${req.body.email} email address already exists`,
        });
      }

      // Create the user if user email is unique
      else if (!user) {
        user = await User.create({
          name: req.body.name,
          email: req.body.email,
          password: secPass,
        });
      }

      // Creating Authorization token for login
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      // Respond with the created user data
      let signupSuccess = true;
      let emailExists = false;
      res.status(200).json({ emailExists, signupSuccess, authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Unexpected error occured! :(");
    }
  }
);

// Route 2: Logging in the user with email and password,No login required. using POST api/auth/login.
router.post(
  "/login",
  [
    // Login with email and password!
    body("email", "Please login with correct credentials").isEmail(),
    body("password", "Password cannont be blank").exists(),
  ],
  async (req, res) => {
    // This is for validation if user has been created or not
    let loginSuccess = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Validation errors
      return res.status(400).json({ errors: result.array() });
    }

    try {
      const { email, password } = req.body;
      // Check whether the email and password is correct or not
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          error: `Please login with correct credentials`,
        });
      }
      let comparePass = await bcrypt.compare(password, user.password);
      if (!comparePass) {
        return res.status(400).json({
          error: `Please login with correct credentials`,
        });
      }
      // Storing data of user here for compatbility purpose
      const data = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
      // Creating Authorization token for login
      const authToken = jwt.sign(data, JWT_SECRET);
      // Giving authorization token and user's name as response if email and password is correct
      loginSuccess = true;
      res.status(200).json({ loginSuccess: loginSuccess, authToken: authToken });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ error: "Internal server error :(" });
    }
  }
);

// Route 3: Getting user details, Login required, POST: api/auth/getuser
// router.post("/getuser", fetchuser, async (req, res) => {
//   try {
//     userId = req.user.id;
//     const user = await User.findById(userId).select("-password");
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error!" });
//   }
// });

// module.exports = router;

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    // Get all user details except password 
    const user = await User.findById(userId).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error!" });
  }
});

module.exports = router;
