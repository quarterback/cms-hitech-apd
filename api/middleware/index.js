const apd = require('./apd');
const auth = require('./auth');
const model = require('./model');

module.exports = {
  ...apd,
  ...auth,
  ...model
};
