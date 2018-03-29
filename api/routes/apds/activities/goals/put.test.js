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

tap.test('apd activity goal PUT endpoint', async endpointTest => {
  const sandbox = sinon.createSandbox();
  const app = { put: sandbox.stub() };

  const ActivityModel = {};

  const GoalModel = {
    forge: sandbox.stub()
  };
  const ObjectiveModel = {
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
    putEndpoint(app, ActivityModel, GoalModel, ObjectiveModel);

    setupTest.ok(
      app.put.calledWith(
        '/activities/:id/goals',
        loggedIn,
        loadActivity(),
        userCanEditAPD(ActivityModel),
        expectArray(true, { error: 'edit-activity-invalid-goals' }),
        deleteFromActivity('goals'),
        sinon.match.func,
        sendOne(ActivityModel, {
          fetch: { withRelated: ['goals.objectives', 'approaches'] }
        })
      ),
      'apd activity PUT endpoint is registered'
    );
  });

  endpointTest.test('edit APD activity handler', async handlerTest => {
    const handler = putEndpoint.createGoalsAndObjectives;
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
          description: 'goal 1',
          objectives: ['objective 1.1', 'objective 1.2']
        },
        { description: 'goal 2', objectives: ['objective 2.1'] },
        { hello: 'world', objectives: ['objective 3.1', 'objective 3.2'] }
      ];

      GoalModel.forge.returns({
        save: sinon.stub().resolves(),
        get: sinon
          .stub()
          .withArgs('id')
          .returns('goal-id')
      });

      ObjectiveModel.forge.returns({
        save: sinon.stub().resolves()
      });

      await handler(GoalModel, ObjectiveModel)(req, res, next);

      validTest.ok(
        GoalModel.forge.calledWith({
          description: 'goal 1',
          activity_id: 'activity-id'
        }),
        'first goal created'
      );
      validTest.ok(
        ObjectiveModel.forge.calledWith({
          description: 'objective 1.1',
          activity_goal_id: 'goal-id'
        }),
        'first goal, first objective created'
      );
      validTest.ok(
        ObjectiveModel.forge.calledWith({
          description: 'objective 1.2',
          activity_goal_id: 'goal-id'
        }),
        'first goal, second objective created'
      );

      validTest.ok(
        GoalModel.forge.calledWith({
          description: 'goal 2',
          activity_id: 'activity-id'
        }),
        'second goal created'
      );
      validTest.ok(
        ObjectiveModel.forge.calledWith({
          description: 'objective 2.1',
          activity_goal_id: 'goal-id'
        }),
        'second goal, first objective created'
      );

      validTest.ok(GoalModel.forge.calledTwice, 'two goals created');
      validTest.ok(ObjectiveModel.forge.calledThrice, 'three goals created');
      validTest.ok(next.called, 'next is called');
    });
  });
});
