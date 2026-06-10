const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

//HÄMTA token från AUTH:BEARER (token) header
const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    //["Bearer", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJEdW5lIiwiZW1haWwiOiJkdW5lQHlhaG9vLmNvbSIsImlkIjoiNmEwNDQ3MjZlOWI1M2UwYTlhOThmYzczIn0sImlhdCI6MTc3ODY2NTM5NSwiZXhwIjoxNzc4NjY2Mjk1fQ.6YMufNZoFlGfVbG_9dd9grrJy0PeL_VwziMTXvwPQ2Y"]
    token = authHeader.split(" ")[1];

    //OM token finns
    if (!token) {
      res.status(401);
      throw new Eror("No token");
    }
    // OM token giltig
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("Not authorized");
      }
      console.log(decoded);
      req.user = decoded.user;
      next();
    });
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const optionalValidateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];
    if (token) {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (!err) req.user = decoded.user;
        next();
      });
      return;
    }
  }
  next();
});

module.exports = validateToken;
module.exports.optionalValidateToken = optionalValidateToken;
