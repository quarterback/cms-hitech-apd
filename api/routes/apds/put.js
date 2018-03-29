const logger = require('../../logger')('apds route put');
const {
  loggedIn,
  userCanEditAPD,
  upsert,
  save,
  sendOne
} = require('../../middleware');
const { apd: defaultApdModel } = require('../../db').models;

const fixupBody = (req, res, next) => {
  req.body = {
    id: +req.params.id,
    status: req.body.status,
    period: req.body.period
  };
  next();
};

module.exports = (app, ApdModel = defaultApdModel) => {
  logger.silly('setting up PUT /apds/:id route');
  app.put(
    '/apds/:id',
    loggedIn,
    userCanEditAPD(),
    fixupBody,
    upsert(ApdModel),
    save,
    sendOne(ApdModel)
  );
};

module.exports.fixupBody = fixupBody;
