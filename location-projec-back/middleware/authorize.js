// Ways to send token:
/*
i) Send in body (but not applicable where requests dont have body)
ii) Send using params (URL?token=something)
iii) Send using headers( implementing it here) 
*/

const HttpError = require("../models/http-error");
const jwt= require('jsonwebtoken');

module.exports = (req, res, next) => {
    if(req.method==='OPTIONS')
    {
        return next();
    }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
        return next(new HttpError("Authentication failed", 401));
    }  // Authorization: 'BEARER Token'
    const decodedToken=jwt.verify(token,`${process.env.JWT_KEY}`);
    req.userData= {userId: decodedToken.userId};
    next();
  } catch (error) {
    return next(new HttpError("Authentication failed", 401));
  }
};
