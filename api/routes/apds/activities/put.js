const logger = require('../../../logger')('apd activites route put');
const { apdActivity: defaultActivityModel } = require('../../../db').models;
const {
  loggedIn,
  loadActivity,
  userCanEditAPD,
  upsert,
  validate,
  save,
  sendOne
} = require('../../../middleware');

const fixupBody = (req, res, next) => {
  req.body = {
    id: +req.params.id,
    name: req.body.name,
    description: req.body.description
  };
  next();
};

module.exports = (app, ActivityModel = defaultActivityModel) => {
  logger.silly('setting up PUT /activities/:id route');
  app.put(
    '/activities/:id',
    loggedIn,
    loadActivity(),
    userCanEditAPD(ActivityModel),
    fixupBody,
    upsert(ActivityModel),
    validate,
    save,
    sendOne(ActivityModel)
  );
};

module.exports.fixupBody = fixupBody;
