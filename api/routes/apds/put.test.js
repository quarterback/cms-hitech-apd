const tap = require('tap');
const sinon = require('sinon');

const {
  loggedIn,
  userCanEditAPD,
  upsert,
  save,
  sendOne
} = require('../../middleware');
const putEndpoint = require('./put');

tap.test('apds PUT endpoint', async endpointTest => {
  const sandbox = sinon.createSandbox();
  const app = { put: sandbox.stub() };
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
    const ApdModel = {};
    putEndpoint(app, ApdModel);

    setupTest.ok(
      app.put.calledWith(
        '/apds/:id',
        loggedIn,
        userCanEditAPD(),
        putEndpoint.fixupBody,
        upsert(ApdModel),
        save,
        sendOne(ApdModel)
      ),
      'apds PUT endpoint is registered'
    );
  });

  endpointTest.test('modifies the request body', async handlerTest => {
    const fixupBody = putEndpoint.fixupBody;

    const req = {
      params: { id: '1' },
      body: {
        status: 'major status',
        period: 'semicolon',
        other: 'stuff',
        gets: 'removed'
      }
    };

    fixupBody(req, res, next);

    handlerTest.match(
      req.body,
      {
        id: 1,
        status: 'major status',
        period: 'semicolon'
      },
      'request body is set as expected'
    );
    handlerTest.ok(next.calledOnce, 'next is called');
  });
});
