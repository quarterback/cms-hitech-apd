const logger = require('../../../logger')('apd activites route put');
const { apdActivity: defaultActivityModel } = require('../../../db').models;
const {
  loggedIn,
  loadActivity,
  userCanEditAPD,
  pickBody,
  upsert,
  addField,
  validate,
  save,
  sendOne
} = require('../../../middleware');

module.exports = (app, ActivityModel = defaultActivityModel) => {
  logger.silly('setting up PUT /activities/:id route');
  app.put(
    '/activities/:id',
    loggedIn,
    loadActivity(),
    userCanEditAPD(ActivityModel),
    pickBody('name', 'description'),
    upsert(ActivityModel),
    addField('id', 'id'),
    validate,
    save,
    sendOne(ActivityModel)
  );
};
