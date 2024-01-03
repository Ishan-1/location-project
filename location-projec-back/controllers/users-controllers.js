const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

// For authentication
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, "-password");
    if (users.length === 0) {
      const err = new HttpError("No users found.", 404);
      return next(err);
    }
    res.json({
      users: (await users).map((user) => {
        return user.toObject({ getters: true });
      }),
    });
  } catch (error) {
    const err = new HttpError(
      "Could not fetchr users :( due to some unexpected error.",
      500
    );
    return next(err);
  }
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, email, password } = req.body;

  try {
    const user = await User.find({ email: email });
    let hasUser = false;
    if (user.length > 0) {
      hasUser = true;
    }
    if (hasUser) {
      return next(
        new HttpError("Could not create user, email already exists.", 422)
      );
    }

    let hashPassword;
    hashPassword= await bcrypt.hash(password,12);

    const createdUser = new User({
      name: name,
      email: email,
      password: hashPassword,
      image:
        req.file.path,
      places: [],
    });
    createdUser.save();

    // Encode an object with a private key(never shared) and expiry time
    let token=jwt.sign({userId:createdUser.id,email: createdUser.email},`${process.env.JWT_KEY}`,{expiresIn: '1h'});

    res.status(201).json({ userId: createdUser.id,email: createdUser.email,token: token });
  } catch (error) {
    const err = new HttpError(
      "Could not register user :( due to some unexpected error.",
      500
    );
    return next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.find({ email: email});
    if (user.length > 0) {
      const isPass=await bcrypt.compare(password,user[0].password);
      if(isPass)
      {
        let token=jwt.sign({userId:user[0].id,email: user[0].email},`${process.env.JWT_KEY}`,{expiresIn: '1h'});
        res.json({ message: "Logged in!",userId:user[0].id,email:user[0].email,token: token});
      }
      else
      {
        return next(new HttpError("Invalid credentials",422));
      }
    } else {
      return next(new HttpError("Invalid credentials", 422));
    }
  } catch (error) {
    const err = new HttpError(
      "Could not login user :( due to some unexpected error.",
      500
    );
    return next(error);
  }
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
