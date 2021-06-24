const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('@utils/APIError');


/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 15,
  },
  name: {
    type: String,
    trim: true
  },
  location:{
    type:{
      type: String,
      enum:["Point","LineString","Polygon","GeometryCollection"],
      trim: true
    },
    coordinates:{
      type:[]
    }
  },
  address:{
    street:{
      type: String,
      trim: true
    },
    locality:{
      type: String,
      trim: true
    },
    city:{
      type: String,
      trim: true
    },
    state:{
      type: String,
      trim: true
    },
    pincode:{
      type: String,
      trim: true
    },
    coordinate:{
      lat:{ type:Number },
      lon:{ type:Number }
    }
  }
}, {
  timestamps: true,
});

userSchema.index( { location : "2dsphere" } )



/**
 * Methods
 */
userSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id','mobile', 'name', 'email','location', 'address', 'createdAt','updatedAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  }
  
});

/**
 * Statics
 */
userSchema.statics = {
  /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let user;

      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await this.findById(id).exec();
      }
      if (user) {
        return user;
      }

      throw new APIError({
        message: 'User does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  async list({
    page = 1, perPage = 30, name, email,mobile
  }) {
    let options = omitBy({ name,email,mobile }, isNil);
    let users = await this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page * 1 - 1))
      .limit(perPage * 1)
      .exec();
    users = users.map(user => user.transform())
    var count = await this.find(options).exec();
    count = count.length;
    var pages = Math.ceil(count / perPage);
    return { users, count, pages }

  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateMobile(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [{
          field: 'mobile',
          location: 'body',
          messages: ['"mobile" already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);
