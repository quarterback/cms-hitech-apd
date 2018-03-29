const logger = require('../../logger')('apds route put');
const {
  loggedIn,
  userCanEditAPD,
  pickBody,
  upsert,
  addField,
  save,
  sendOne
} = require('../../middleware');
const { apd: defaultApdModel } = require('../../db').models;

module.exports = (app, ApdModel = defaultApdModel) => {
  logger.silly('setting up PUT /apds/:id route');
  app.put(
    '/apds/:id',
    loggedIn,
    userCanEditAPD(),
    pickBody('status', 'period'),
    upsert(ApdModel),
    addField('id', 'id'),
    save,
    sendOne(ApdModel)
  );
};
