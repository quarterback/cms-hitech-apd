const tap = require('tap');
const sinon = require('sinon');

const { loggedIn, sendOne } = require('../../middleware');
const getEndpoint = require('./get');

tap.test('apds GET endpoint', async endpointTest => {
  const sandbox = sinon.createSandbox();

  const app = { get: sandbox.stub() };
  const ApdModel = {};

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
    getEndpoint(app, ApdModel);

    setupTest.ok(
      app.get.calledWith(
        '/apds',
        loggedIn,
        getEndpoint.getUserState,
        sendOne(ApdModel, {
          idField: 'state_id',
          idParam: 'stateID',
          fetch: {
            withRelated: [
              'activities.goals.objectives',
              'activities.approaches',
              'activities.expenses'
            ]
          }
        })
      ),
      'user-specific apds GET endpoint is registered'
    );
  });

  endpointTest.test('state ID handler', async handlerTest => {
    handlerTest.test(
      'sends an unauthorized error code if the user does not have an associated state',
      async invalidTest => {
        getEndpoint.getUserState(
          { params: {}, user: { state: null } },
          res,
          next
        );

        invalidTest.ok(res.status.calledWith(401), 'HTTP status set to 401');
        invalidTest.ok(res.send.notCalled, 'no body is sent');
        invalidTest.ok(res.end.called, 'response is terminated');
        invalidTest.ok(next.notCalled, 'next is not called');
      }
    );

    handlerTest.test(
      'continues execution if the user does have an associated state',
      async invalidTest => {
        getEndpoint.getUserState(
          { params: {}, user: { state: 'aa' } },
          res,
          next
        );

        invalidTest.ok(res.status.notCalled, 'HTTP status is not set');
        invalidTest.ok(res.send.notCalled, 'no body is sent');
        invalidTest.ok(res.end.notCalled, 'response is not terminated');
        invalidTest.ok(next.calledOnce, 'next is called');
      }
    );
  });
});
