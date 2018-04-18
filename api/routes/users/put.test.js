const tap = require('tap');
const sinon = require('sinon');

const { can, synchronizeSpecific } = require('../../middleware');
const putEndpoint = require('./put');

tap.test('users PUT endpoint', async endpointTest => {
  const sandbox = sinon.createSandbox();
  const app = {
    put: sandbox.stub()
  };

  const UserModel = {
    where: sandbox.stub(),
    fetch: sandbox.stub()
  };

  const res = {
    status: sandbox.stub(),
    send: sandbox.stub(),
    end: sandbox.stub()
  };

  endpointTest.beforeEach(async () => {
    sandbox.resetBehavior();
    sandbox.resetHistory();

    UserModel.where.returns(UserModel);

    res.status.returns(res);
    res.send.returns(res);
    res.end.returns(res);
  });

  endpointTest.test('setup', async setupTest => {
    putEndpoint(app);

    setupTest.ok(
      app.put.calledWith(
        '/users/:id',
        can('edit-users'),
        synchronizeSpecific(putEndpoint.syncResponder())
      ),
      'users PUT endpoint is registered'
    );
  });

  endpointTest.test(
    'synchronize responder returns the expected data',
    async responderTests => {
      responderTests.test(
        'throws an error if user is not found',
        async test => {
          UserModel.fetch.resolves(null);
          const responder = putEndpoint.syncResponder(UserModel);

          try {
            await responder({ params: { id: 'user-id' } });
            test.fail('rejects');
          } catch (e) {
            test.pass('rejects');
            test.ok(
              UserModel.where.calledWith({ id: 'user-id' }),
              'searches for the specified user'
            );
            test.equal(e.statusCode, 404, 'exception has 404 status code');
            test.notOk(e.error, 'exception does not have an error property');
          }
        }
      );

      responderTests.test(
        'returns the user and action definition',
        async test => {
          UserModel.fetch.resolves('this is a user!');
          const responder = putEndpoint.syncResponder(UserModel);

          const out = await responder({ params: { id: 'user-id' } });

          test.ok(
            UserModel.where.calledWith({ id: 'user-id' }),
            'searches for the specified user'
          );
          test.same(
            out,
            { model: 'this is a user!', action: 'edit-user' },
            'sends back the expected model and action'
          );
        }
      );
    }
  );
});
