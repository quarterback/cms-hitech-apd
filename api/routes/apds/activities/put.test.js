const tap = require('tap');
const sinon = require('sinon');

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
      upsert(ActivityModel),
      addField('id', 'id'),
      validate,
      save,
      sendOne(ActivityModel)
    ),
    'apd activity PUT endpoint is registered'
  );
});
