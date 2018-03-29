const logger = require('../../../logger')('apd activites route post');
const { apdActivity: defaultActivityModel } = require('../../../db').models;
const {
  loggedIn,
  userCanEditAPD,
  upsert,
  addField,
  validate,
  save,
  sendMany
} = require('../../../middleware');

module.exports = (app, ActivityModel = defaultActivityModel) => {
  logger.silly('setting up POST /apds/:id/activities route');
  app.post(
    '/apds/:id/activities',
    loggedIn,
    userCanEditAPD(),
    upsert(ActivityModel),
    addField({ fieldName: 'apd_id', fromParam: 'id' }),
    validate,
    save,
    sendMany(ActivityModel, {
      fetch: {
        withRelated: ['approaches', 'goals.objectives', 'expenses.entries']
      },
      idField: 'apd_id'
    })
  );
};
