const tap = require('tap');
const sinon = require('sinon');

const {
  loggedIn,
  loadActivity,
  userCanEditAPD,
  pickBody,
  update,
  addField,
  validate,
  save,
  sendOne
} = require('../../../middleware');
const putEndpoint = require('./put');

tap.test('apd activity PUT endpoint setup', async endpointTest => {
  const app = { put: sinon.spy() };

  const ActivityModel = {};

  putEndpoint(app, ActivityModel);

  endpointTest.ok(
    app.put.calledWith(
      '/activities/:id',
      loggedIn,
      loadActivity(),
      userCanEditAPD(ActivityModel),
      pickBody('name', 'description'),
      update(ActivityModel),
      addField('id', 'id'),
      validate({ errorPrefix: 'update-activity' }),
      save,
      sendOne(ActivityModel, {
        fetch: { withRelated: ['approaches', 'expenses', 'goals.objectives'] }
      })
    ),
    'apd activity PUT endpoint is registered'
  );
});
