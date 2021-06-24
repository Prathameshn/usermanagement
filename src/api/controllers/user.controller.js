const httpStatus = require('http-status');
const { omit } = require('lodash');
const User = require('@models/user.model');
const APIError = require('@utils/APIError');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const user = await User.get(id);
    req.locals = { user };
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Get user
 * @public
 */
exports.get = (req, res) => res.json(req.locals.user.transform());

/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateMobile(error));
  }
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { user } = req.locals;
    const newUser = new User(req.body);
    const ommitRole = user.role !== 'admin' ? 'role' : '';
    const newUserObject = omit(newUser.toObject(), '_id', ommitRole);

    await user.updateOne(newUserObject, { override: true, upsert: true });
    const savedUser = await User.findById(user._id);
    res.status(httpStatus.OK);
    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateMobile(error));
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = (req, res, next) => {
  const updatedUser = omit(req.body, {});
  const user = Object.assign(req.locals.user, updatedUser);


  user.save()
    .then(savedUser => {
      res.status(httpStatus.OK);
      res.json(savedUser.transform())
    })
    .catch(e => next(User.checkDuplicateMobile(e)));
};

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const users = await User.list(req.query);
    res.status(httpStatus.OK);
    res.json(users);
  } catch (error) {
    next(error);
  }
};


exports.getUserList = async (req, res, next) => {
  try {
    const users = await User.find({}).lean();
    req.locals = {users}
    return next()
  } catch (error) {
    next(error);
  }
};

exports.calculateDistance = async(req,res,next)=>{
  try {
    let { lat, lon} = req.query
    let { users } = req.locals
    if(lat && lon){
      for(i=0;i>=0;i++)
      {
        if(users[i]){
          let coordinates = users[i].address.coordinates
          if(coordinates.lat && coordinates.lon){
            users[i].distance = await getDistanceFromLatLonInKm(coordinates.lat, coordinates.lon,lat,lon)
          }
        }else{
          return next()
        }
      }
    }else{
      next(new APIError({message:"Please provide provide lat and lon"}));
    }
  } catch (error) {
    next(error);
  }
}


exports.sortUserlistByDistance = async (req, res, next) => {
  try {
    let {users} = req.locals 
    users.sort(function(a, b) {
      var keyA = a.distance,
        keyB = b.distance;
      // Compare the 2 dates
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
    req.locals  = {users}
    return next()
  } catch (error) {
    next(error);
  }
};

exports.nearestUserlist = async (req, res, next) => {
  try {
    let {users} = req.locals 
    return res.json(users)
  } catch (error) {
    next(error);
  }
};

async function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
  const { user } = req.locals;

  user.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};
