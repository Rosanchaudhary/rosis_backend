const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    //const token = authHeader.split(" ")[1];
    //token should be used
    jwt.verify(authHeader, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

const isAdmin = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decodedToken = jwt.verify(token, secretKey);
    if (decodedToken.isAdmin) {
      // If the user is an admin, proceed to the next middleware or route handler.
      next();
    } else {
      // If the user is not an admin, return a 403 Forbidden error.
      return res.status(403).json({ message: "You do not have admin access." });
    }
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.userId;
  } catch (err) {
    return null;
  }
};

module.exports = { authenticateToken, getUserIdFromToken, isAdmin };
