const tap = require('tap');
const sinon = require('sinon');

const {
  loggedIn,
  loadActivity,
  userCanEditAPD,
  expectArray,
  deleteFromActivity,
  sendOne
} = require('../../../../middleware');
const putEndpoint = require('./put');

tap.test('apd activity expenses PUT endpoint', async endpointTest => {
  const sandbox = sinon.createSandbox();
  const app = { put: sandbox.stub() };

  const ActivityModel = {};

  const ExpenseModel = {
    forge: sandbox.stub()
  };
  const ExpenseEntryModel = {
    forge: sandbox.stub()
  };

  const res = {
    status: sandbox.stub(),
    send: sandbox.stub(),
    end: sandbox.stub()
  };

  endpointTest.beforeEach(done => {
    sandbox.resetBehavior();
    sandbox.resetHistory();

    res.status.returns(res);
    res.send.returns(res);
    res.end.returns(res);

    done();
  });

  endpointTest.test('setup', async setupTest => {
    putEndpoint(app, ActivityModel, ExpenseModel, ExpenseEntryModel);

    setupTest.ok(
      app.put.calledWith(
        '/activities/:id/expenses',
        loggedIn,
        loadActivity(),
        userCanEditAPD(ActivityModel),
        expectArray(true, { error: 'edit-activity-invalid-expenses' }),
        deleteFromActivity('expenses'),
        sinon.match.func,
        sendOne(ActivityModel, {
          fetch: { withRelated: ['goals.objectives', 'approaches'] }
        })
      ),
      'apd activity expenses PUT endpoint is registered'
    );
  });

  endpointTest.test('edit APD activity expenses handler', async handlerTest => {
    const handler = putEndpoint.createExpenses;
    const next = sandbox.spy();
    let req;

    handlerTest.beforeEach(async () => {
      req = {
        user: { id: 1 },
        params: { id: 1 },
        meta: {
          activity: {
            get: sandbox
              .stub()
              .withArgs('id')
              .returns('activity-id')
          }
        }
      };
    });

    handlerTest.test(
      'sends a server error if anything goes wrong',
      async saveTest => {
        delete req.meta;
        await handler()(req, res, next);

        saveTest.ok(res.status.calledWith(500), 'HTTP status set to 500');
        saveTest.ok(next.notCalled, 'next is not called');
      }
    );

    handlerTest.test('updates valid goals', async validTest => {
      req.body = [
        {
          name: 'expense 1',
          entries: [
            {
              year: 1,
              amount: 1,
              description: 'one'
            },
            {
              year: 2,
              amount: 2,
              description: 'two'
            }
          ]
        },
        {
          name: 'expense 2',
          entries: [
            {
              year: 3,
              amount: 3,
              description: 'three'
            }
          ]
        },
        { hello: 'world', entries: ['entry 3.1', 'entry 3.2'] }
      ];

      ExpenseModel.forge.returns({
        save: sinon.stub().resolves(),
        get: sinon
          .stub()
          .withArgs('id')
          .returns('expense-id')
      });

      ExpenseEntryModel.forge.returns({
        save: sinon.stub().resolves()
      });

      await handler(ExpenseModel, ExpenseEntryModel)(req, res, next);

      validTest.ok(
        ExpenseModel.forge.calledWith({
          name: 'expense 1',
          activity_id: 'activity-id'
        }),
        'first goal created'
      );
      validTest.ok(
        ExpenseEntryModel.forge.calledWith({
          year: 1,
          amount: 1,
          description: 'one',
          expense_id: 'expense-id'
        }),
        'first goal, first objective created'
      );
      validTest.ok(
        ExpenseEntryModel.forge.calledWith({
          year: 2,
          amount: 2,
          description: 'two',
          expense_id: 'expense-id'
        }),
        'first goal, second objective created'
      );

      validTest.ok(
        ExpenseModel.forge.calledWith({
          name: 'expense 2',
          activity_id: 'activity-id'
        }),
        'second goal created'
      );
      validTest.ok(
        ExpenseEntryModel.forge.calledWith({
          year: 3,
          amount: 3,
          description: 'three',
          expense_id: 'expense-id'
        }),
        'second goal, first objective created'
      );

      validTest.ok(ExpenseModel.forge.calledTwice, 'two goals created');
      validTest.ok(ExpenseEntryModel.forge.calledThrice, 'three goals created');
      validTest.ok(next.called, 'next is called');
    });
  });
});
