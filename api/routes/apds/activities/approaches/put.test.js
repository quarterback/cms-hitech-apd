const tap = require('tap');
const sinon = require('sinon');

const {
  loggedIn,
  loadActivity,
  userCanEditAPD,
  expectArray,
  build,
  addField,
  validate,
  deleteFromActivity,
  save,
  sendOne
} = require('../../../../middleware');
const putEndpoint = require('./put');

tap.test('apd activity approach PUT endpoint', async endpointTest => {
  const sandbox = sinon.createSandbox();
  const app = { put: sandbox.stub() };

  const ActivityModel = {};
  const ApproachModel = {};

  endpointTest.test('setup', async setupTest => {
    putEndpoint(app, ActivityModel, ApproachModel);

    setupTest.ok(
      app.put.calledWith(
        '/activities/:id/approaches',
        loggedIn,
        loadActivity(),
        userCanEditAPD(ActivityModel),
        expectArray(),
        build(ApproachModel),
        addField({ fieldName: 'activity_id', fromParam: 'id' }),
        validate,
        deleteFromActivity('approaches'),
        save,
        sendOne(ActivityModel, {
          fetch: {
            withRelated: ['goals.objectives', 'approaches']
          }
        })
      ),
      'apd activity approach PUT endpoint is registered'
    );
  });
});
