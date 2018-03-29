const tap = require('tap');
const sinon = require('sinon');

const {
  loggedIn,
  loadActivity,
  userCanEditAPD,
  upsert,
  validate,
  save,
  sendOne
} = require('../../../middleware');
const putEndpoint = require('./put');

tap.test('apd activity PUT endpoint', async endpointTest => {
  const sandbox = sinon.createSandbox();
  const app = { put: sandbox.stub() };

  const ActivityModel = {};

  const res = {
    status: sandbox.stub(),
    send: sandbox.stub(),
    end: sandbox.stub()
  };

  const next = sandbox.spy();

  endpointTest.beforeEach(done => {
    sandbox.resetBehavior();
    sandbox.resetHistory();

    res.status.returns(res);
    res.send.returns(res);
    res.end.returns(res);

    done();
  });

  endpointTest.test('setup', async setupTest => {
    putEndpoint(app, ActivityModel);

    setupTest.ok(
      app.put.calledWith(
        '/activities/:id',
        loggedIn,
        loadActivity(),
        userCanEditAPD(ActivityModel),
        putEndpoint.fixupBody,
        upsert(ActivityModel),
        validate,
        save,
        sendOne(ActivityModel)
      ),
      'apd activity PUT endpoint is registered'
    );
  });

  endpointTest.test('modifies the request body', async handlerTest => {
    const fixupBody = putEndpoint.fixupBody;

    const req = {
      params: { id: '1' },
      body: {
        name: 'activity name',
        description: 'some words here',
        other: 'stuff',
        gets: 'removed'
      }
    };

    fixupBody(req, res, next);

    handlerTest.match(
      req.body,
      {
        id: 1,
        name: 'activity name',
        description: 'some words here'
      },
      'request body is set as expected'
    );
    handlerTest.ok(next.calledOnce, 'next is called');
  });
});
