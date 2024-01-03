const { validationResult } = require("express-validator");

const fs =require('fs');

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }

  try {
    const place = await Place.findById(placeId);
    if (!place) {
      const error = new HttpError(
        "Could not find a place for the provided id.",
        404
      );
      return next(error);
    }
    // Convert to normal JS object with id included and then return it as response
    res.json({ place: place.toObject({ getters: true }) });
  } catch (error) {
    console.log(error);
    const err = new HttpError(
      "Could not find a place for the provided id.",
      500
    );
    return next(err);
  }
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  try {
    const places = await Place.find({ creator: userId });
    if (!places) {
      const err = new HttpError("No places found for the given user", 404);
      return next(err);
    }
    res.json({
      places: places.map((place) => {
        return place.toObject({ getters: true });
      }),
    });
  } catch (error) {
    console.log(error);
    const err = new HttpError("Couldn't fetch places for the given user", 500);
    return next(err);
  }
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address} = req.body;
  let creator = req.userData.userId;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    console.log(error);
    const err = new HttpError(
      "Could not fetch coordinates for the place, please try again",
      422
    );
    return next(err);
  }
  let user;
  try {
    user = await User.findById(creator);
    if (!user) {
      const err = new HttpError("Invalid creator ID provided", 422);
      return next(err);
    }
  } catch (error) {
    console.log(error);
    const err = new HttpError("Creating place failed,try again", 500);
    return next(err);
  }

  const createdPlace = new Place({
    title: title,
    description: description,
    address: address,
    location: coordinates,
    image: req.file.path,
    creator: creator,
  });
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.log(error);
    const err = new HttpError("Creating place failed,try again", 500);
    return next(err);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  try {
    const updatedPlace = await Place.findById(placeId);
    if(!updatedPlace)
    {
      return next(new HttpError("Cannot find this place",422));
    }
    if(updatedPlace.creator.toString() !== req.userData.userId)
    {
      return next(new HttpError("You are unauthorized to update this place",401));
    }
    updatedPlace.title=title;
    updatedPlace.description=description;
    await updatedPlace.save();
    res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
  } catch (error) {
    console.log(error);
    const err = new HttpError("Unable to update data.", 500);
    return next(err);
  }
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  try {
    const place = await Place.findById(placeId);
    if (!place) {
      return next(new HttpError("Given place ID doesn't exist", 422));
    }
    if(place.creator.toString() !== req.userData.userId)
    {
      return next(new HttpError("You are unauthorized to delete this place",401));
    }
    await place.populate("creator");
    const sess = await mongoose.startSession();
    sess.startTransaction();
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await Place.findByIdAndDelete(placeId).session(sess);
    sess.commitTransaction();
    fs.unlink(place.image,(err)=>{console.log(err)});
    res.status(200).json({ message: "Deleted place." });
  } catch (error) {
    const err = new HttpError("Could not delete place", 500);
    return next(error);
  }
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
