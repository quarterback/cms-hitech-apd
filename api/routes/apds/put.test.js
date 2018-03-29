const tap = require('tap');
const sinon = require('sinon');

const {
  loggedIn,
  userCanEditAPD,
  pickBody,
  upsert,
  addField,
  save,
  sendOne
} = require('../../middleware');
const putEndpoint = require('./put');

tap.test('apds PUT endpoint setup', async endpointTest => {
  const app = { put: sinon.spy() };

  const ApdModel = {};
  putEndpoint(app, ApdModel);

  endpointTest.ok(
    app.put.calledWith(
      '/apds/:id',
      loggedIn,
      userCanEditAPD(),
      pickBody('status', 'period'),
      upsert(ApdModel),
      addField('id', 'id'),
      save,
      sendOne(ApdModel)
    ),
    'apds PUT endpoint is registered'
  );
});
