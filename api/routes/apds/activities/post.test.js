const tap = require('tap');
const sinon = require('sinon');

const {
  loggedIn,
  userCanEditAPD,
  upsert,
  addField,
  validate,
  save,
  sendMany
} = require('../../../middleware');
const postEndpoint = require('./post');

tap.test('apd activity POST endpoint', async endpointTest => {
  const sandbox = sinon.createSandbox();
  const app = { post: sandbox.stub() };

  const ActivityModel = {};

  const res = {
    status: sandbox.stub(),
    send: sandbox.stub(),
    end: sandbox.stub()
  };

  endpointTest.beforeEach(async () => {
    sandbox.resetBehavior();
    sandbox.resetHistory();

    res.status.returns(res);
    res.send.returns(res);
    res.end.returns(res);
  });

  endpointTest.test('setup', async setupTest => {
    postEndpoint(app, ActivityModel);

    setupTest.ok(
      app.post.calledWith(
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
      ),
      'apd activity POST endpoint is registered'
    );
  });
});
